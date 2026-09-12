"""Pricing-rule tests for the Silva's Handyman estimate engine."""

from __future__ import annotations

import json
import unittest
from pathlib import Path

from estimate_engine import (
    apply_material_then_profit,
    apply_profit,
    build_siding_demo_reinstall_lines,
    chimney_area_sf,
    dollars_to_cents,
    summarize,
)

ROOT = Path(__file__).resolve().parent


def load() -> tuple[dict, dict]:
    pricing = json.loads((ROOT / "wizard-pricing.json").read_text(encoding="utf-8"))
    job = json.loads((ROOT / "jobs" / "siding-demo-reinstall.json").read_text(encoding="utf-8"))
    return pricing, job


class MarkupRulesTest(unittest.TestCase):
    def test_profit_on_demo_lump(self) -> None:
        self.assertEqual(apply_profit(100_000, 30), 130_000)

    def test_material_markup_then_profit(self) -> None:
        # $100 cost → 20% markup = $120 → 30% profit = $156
        self.assertEqual(apply_material_then_profit(10_000, 20, 30), 15_600)

    def test_chimney_area(self) -> None:
        self.assertEqual(chimney_area_sf(25, 8), 200)


class SidingJobTest(unittest.TestCase):
    def setUp(self) -> None:
        self.pricing, self.job = load()
        self.lines = build_siding_demo_reinstall_lines(self.pricing, self.job)
        self.totals = summarize(self.lines)

    def test_demo_is_single_lump(self) -> None:
        demo = [item for item in self.lines if item.section == "Demolition"]
        self.assertEqual(len(demo), 1)
        self.assertEqual(demo[0].cost_cents, 100_000)
        self.assertEqual(demo[0].quoted_cents, 130_000)
        self.assertEqual(demo[0].qty, 1)
        self.assertEqual(demo[0].unit, "ls")

    def test_no_line_quoted_at_raw_cost(self) -> None:
        for item in self.lines:
            self.assertGreater(
                item.quoted_cents,
                item.cost_cents,
                msg=f"{item.description} was quoted at raw cost",
            )

    def test_materials_get_both_markups(self) -> None:
        for item in self.lines:
            if item.kind != "material":
                continue
            expected = apply_material_then_profit(
                item.cost_cents,
                self.pricing["materialMarkupPercent"],
                self.pricing["profitMarginPercent"],
            )
            self.assertEqual(item.quoted_cents, expected, msg=item.description)

    def test_labor_and_fees_get_profit_only(self) -> None:
        for item in self.lines:
            if item.kind not in {"labor", "fee"}:
                continue
            expected = apply_profit(item.cost_cents, self.pricing["profitMarginPercent"])
            self.assertEqual(item.quoted_cents, expected, msg=item.description)

    def test_required_scope_lines_present(self) -> None:
        descriptions = [item.description.lower() for item in self.lines]
        expected_bits = [
            "demo and remove",
            "prep siding",
            "prep window trims",
            "reinstall siding, side of house",
            "reinstall siding around chimney",
            "reinstall window trims",
            "color match paint to existing siding",
            "color match paint to existing window trim",
            "paint siding",
            "paint window trims",
            "siding boards — house wall",
            "siding boards — chimney",
            "window trim material",
            "fasteners",
            "paint and primer — siding",
            "paint and primer — window trims",
            "dump / disposal",
        ]
        for bit in expected_bits:
            self.assertTrue(
                any(bit in desc for desc in descriptions),
                msg=f"Missing line covering: {bit}",
            )

    def test_house_siding_qty(self) -> None:
        wall = next(
            item
            for item in self.lines
            if item.description == "Reinstall siding, side of house"
        )
        self.assertEqual(wall.qty, 450)

    def test_material_waste_quantities(self) -> None:
        house = next(item for item in self.lines if item.description.startswith("Siding boards — house"))
        chimney = next(item for item in self.lines if item.description.startswith("Siding boards — chimney"))
        self.assertEqual(house.qty, 495)
        self.assertEqual(chimney.qty, 230)

    def test_window_count(self) -> None:
        counted = [
            item
            for item in self.lines
            if item.unit == "ea"
            and (
                item.description.startswith("Prep window trims")
                or item.description.startswith("Reinstall window trims")
                or item.description.startswith("Paint window trims")
            )
        ]
        self.assertEqual(len(counted), 3)
        for item in counted:
            self.assertEqual(item.qty, 13)

    def test_window_trim_wood_cost(self) -> None:
        wood = next(item for item in self.lines if item.description == "Window trim material")
        self.assertEqual(wood.cost_cents, 16_000)
        self.assertEqual(wood.quoted_cents, apply_material_then_profit(16_000, 20, 30))
        self.assertEqual(wood.quoted_cents, 24_960)

    def test_dump_is_separate_from_demo(self) -> None:
        dump = next(item for item in self.lines if item.kind == "fee")
        demo = next(item for item in self.lines if item.section == "Demolition")
        self.assertEqual(dump.cost_cents, dollars_to_cents(self.pricing["fees"]["dump10Yard"]))
        self.assertNotEqual(dump.cost_cents, demo.cost_cents)

    def test_totals_add_up(self) -> None:
        quoted = sum(item.quoted_cents for item in self.lines)
        cost = sum(item.cost_cents for item in self.lines)
        self.assertEqual(self.totals["total_cents"], quoted)
        self.assertEqual(self.totals["subtotal_cost_cents"], cost)
        self.assertEqual(self.totals["profit_cents"], quoted - cost)

    def test_photo_survey_adds_fixtures_and_corner_boards(self) -> None:
        fixtures = next(item for item in self.lines if "fixtures" in item.description.lower())
        corners = next(item for item in self.lines if "corner boards" in item.description.lower())
        self.assertEqual(fixtures.qty, 5)
        self.assertEqual(corners.qty, 75)
        self.assertGreater(fixtures.quoted_cents, fixtures.cost_cents)
        self.assertGreater(corners.quoted_cents, corners.cost_cents)


if __name__ == "__main__":
    unittest.main()
