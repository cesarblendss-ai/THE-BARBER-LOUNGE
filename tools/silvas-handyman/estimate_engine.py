"""Silva's Handyman estimate engine — wizard rates + markup rules."""

from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any


def dollars_to_cents(value: float | int) -> int:
    return int(round(float(value) * 100))


def cents_to_dollars(cents: int) -> float:
    return cents / 100


def format_usd(cents: int) -> str:
    sign = "-" if cents < 0 else ""
    return f"{sign}${abs(cents) / 100:,.2f}"


def apply_profit(cost_cents: int, profit_margin_percent: float) -> int:
    return int(round(cost_cents * (1 + profit_margin_percent / 100)))


def apply_material_then_profit(
    cost_cents: int, material_markup_percent: float, profit_margin_percent: float
) -> int:
    marked = int(round(cost_cents * (1 + material_markup_percent / 100)))
    return apply_profit(marked, profit_margin_percent)


@dataclass(frozen=True)
class LineItem:
    section: str
    description: str
    kind: str  # labor | material | fee
    qty: float
    unit: str
    unit_cost_cents: int
    cost_cents: int
    quoted_cents: int
    notes: str = ""

    @property
    def margin_cents(self) -> int:
        return self.quoted_cents - self.cost_cents


def chimney_area_sf(height_ft: float, girth_ft: float) -> float:
    return round(float(height_ft) * float(girth_ft), 2)


def _labor_line(
    section: str,
    description: str,
    qty: float,
    unit: str,
    unit_cost: float,
    profit_margin_percent: float,
    notes: str = "",
) -> LineItem:
    unit_cost_cents = dollars_to_cents(unit_cost)
    cost_cents = int(round(qty * unit_cost_cents))
    return LineItem(
        section=section,
        description=description,
        kind="labor",
        qty=qty,
        unit=unit,
        unit_cost_cents=unit_cost_cents,
        cost_cents=cost_cents,
        quoted_cents=apply_profit(cost_cents, profit_margin_percent),
        notes=notes,
    )


def _material_line(
    section: str,
    description: str,
    qty: float,
    unit: str,
    unit_cost: float,
    material_markup_percent: float,
    profit_margin_percent: float,
    notes: str = "",
) -> LineItem:
    unit_cost_cents = dollars_to_cents(unit_cost)
    cost_cents = int(round(qty * unit_cost_cents))
    return LineItem(
        section=section,
        description=description,
        kind="material",
        qty=qty,
        unit=unit,
        unit_cost_cents=unit_cost_cents,
        cost_cents=cost_cents,
        quoted_cents=apply_material_then_profit(
            cost_cents, material_markup_percent, profit_margin_percent
        ),
        notes=notes,
    )


def _fee_line(
    section: str,
    description: str,
    cost: float,
    profit_margin_percent: float,
    notes: str = "",
) -> LineItem:
    cost_cents = dollars_to_cents(cost)
    return LineItem(
        section=section,
        description=description,
        kind="fee",
        qty=1,
        unit="ls",
        unit_cost_cents=cost_cents,
        cost_cents=cost_cents,
        quoted_cents=apply_profit(cost_cents, profit_margin_percent),
        notes=notes,
    )


def build_siding_demo_reinstall_lines(
    pricing: dict[str, Any], job: dict[str, Any]
) -> list[LineItem]:
    scope = job["scope"]
    labor = pricing["labor"]
    materials = pricing["materials"]
    fees = pricing["fees"]
    profit = float(pricing["profitMarginPercent"])
    material_markup = float(pricing["materialMarkupPercent"])

    siding_sf = float(scope["sidingSf"])
    chimney_height = float(scope["chimneyHeightFt"])
    chimney_girth = float(scope["chimneyWrapGirthFt"])
    chimney_sf = chimney_area_sf(chimney_height, chimney_girth)
    trims = float(scope["windowTrims"])
    installed_sf = siding_sf + chimney_sf

    siding_buy_sf = round(siding_sf * (1 + float(materials["sidingWastePercent"]) / 100), 2)
    chimney_buy_sf = round(chimney_sf * (1 + float(materials["chimneyWastePercent"]) / 100), 2)

    lines: list[LineItem] = [
        _labor_line(
            "Demolition",
            "Demo and remove existing siding, chimney section, and 13 window trims (lump)",
            1,
            "ls",
            float(scope["demoLumpCost"]),
            profit,
            notes="Hard cost $1,000 covers 450 sq ft siding + ~25 ft chimney + all 13 trims. Not split per surface.",
        ),
        _labor_line(
            "Prep",
            "Prep siding surface for paint",
            siding_sf,
            "sq ft",
            float(labor["prepSidingPerSf"]),
            profit,
        ),
        _labor_line(
            "Prep",
            "Prep window trims for paint",
            trims,
            "ea",
            float(labor["prepTrimEach"]),
            profit,
        ),
        _labor_line(
            "Reinstall / Install",
            "Reinstall siding, side of house",
            siding_sf,
            "sq ft",
            float(labor["reinstallSidingPerSf"]),
            profit,
        ),
        _labor_line(
            "Reinstall / Install",
            "Reinstall siding around chimney",
            chimney_sf,
            "sq ft",
            float(labor["reinstallChimneyPerSf"]),
            profit,
            notes=f"{chimney_height:g} ft height × {chimney_girth:g} ft assumed wrap = {chimney_sf:g} sq ft. Height-premium labor rate.",
        ),
        _labor_line(
            "Reinstall / Install",
            "Reinstall window trims",
            trims,
            "ea",
            float(labor["reinstallTrimEach"]),
            profit,
        ),
    ]

    if scope.get("colorMatchSiding", True):
        lines.append(
            _labor_line(
                "Paint / Color Match",
                "Color match paint to existing siding",
                1,
                "ea",
                float(labor["colorMatchEach"]),
                profit,
            )
        )
    if scope.get("colorMatchTrim", True):
        lines.append(
            _labor_line(
                "Paint / Color Match",
                "Color match paint to existing window trim color",
                1,
                "ea",
                float(labor["colorMatchEach"]),
                profit,
            )
        )

    lines.extend(
        [
            _labor_line(
                "Paint / Color Match",
                "Paint siding, side of house — color-matched",
                siding_sf,
                "sq ft",
                float(labor["paintSidingPerSf"]),
                profit,
            ),
            _labor_line(
                "Paint / Color Match",
                "Paint window trims — color-matched",
                trims,
                "ea",
                float(labor["paintTrimEach"]),
                profit,
            ),
            _material_line(
                "Materials",
                "Siding boards — house wall (incl. waste)",
                siding_buy_sf,
                "sq ft",
                float(materials["sidingPerSf"]),
                material_markup,
                profit,
                notes=f"{siding_sf:g} sq ft + {materials['sidingWastePercent']}% waste",
            ),
            _material_line(
                "Materials",
                "Siding boards — chimney wrap (incl. waste)",
                chimney_buy_sf,
                "sq ft",
                float(materials["sidingPerSf"]),
                material_markup,
                profit,
                notes=f"{chimney_sf:g} sq ft + {materials['chimneyWastePercent']}% waste",
            ),
            _material_line(
                "Materials",
                "Window trim material",
                trims,
                "ea",
                float(materials["trimEach"]),
                material_markup,
                profit,
            ),
            _material_line(
                "Materials",
                "Fasteners and accessories",
                installed_sf,
                "sq ft",
                float(materials["fastenersPerSf"]),
                material_markup,
                profit,
                notes="House wall + chimney wrap, no waste factor",
            ),
            _material_line(
                "Materials",
                "Paint and primer — siding",
                siding_sf,
                "sq ft",
                float(materials["paintSidingPerSf"]),
                material_markup,
                profit,
            ),
            _material_line(
                "Materials",
                "Paint and primer — window trims",
                trims,
                "ea",
                float(materials["paintTrimEach"]),
                material_markup,
                profit,
            ),
        ]
    )

    color_matches = int(bool(scope.get("colorMatchSiding", True))) + int(
        bool(scope.get("colorMatchTrim", True))
    )
    if color_matches:
        lines.append(
            _material_line(
                "Materials",
                "Color-match tint / sample",
                color_matches,
                "ea",
                float(materials["colorMatchTintEach"]),
                material_markup,
                profit,
            )
        )

    if scope.get("includeDumpFee", True):
        lines.append(
            _fee_line(
                "Additional Costs",
                "Dump / disposal fee — removed siding and trim debris",
                float(fees["dump10Yard"]),
                profit,
                notes="10-yard debris box hard cost. Separate from the $1,000 demo labor lump.",
            )
        )

    return lines


def summarize(lines: list[LineItem]) -> dict[str, int]:
    labor_cost = sum(item.cost_cents for item in lines if item.kind == "labor")
    labor_quoted = sum(item.quoted_cents for item in lines if item.kind == "labor")
    material_cost = sum(item.cost_cents for item in lines if item.kind == "material")
    material_quoted = sum(item.quoted_cents for item in lines if item.kind == "material")
    fee_cost = sum(item.cost_cents for item in lines if item.kind == "fee")
    fee_quoted = sum(item.quoted_cents for item in lines if item.kind == "fee")
    return {
        "labor_cost_cents": labor_cost,
        "labor_quoted_cents": labor_quoted,
        "material_cost_cents": material_cost,
        "material_quoted_cents": material_quoted,
        "fee_cost_cents": fee_cost,
        "fee_quoted_cents": fee_quoted,
        "subtotal_cost_cents": labor_cost + material_cost + fee_cost,
        "subtotal_quoted_cents": labor_quoted + material_quoted + fee_quoted,
        "total_cents": labor_quoted + material_quoted + fee_quoted,
        "profit_cents": (labor_quoted + material_quoted + fee_quoted)
        - (labor_cost + material_cost + fee_cost),
    }


def estimate_payload(
    pricing: dict[str, Any], job: dict[str, Any], lines: list[LineItem] | None = None
) -> dict[str, Any]:
    built = lines if lines is not None else build_siding_demo_reinstall_lines(pricing, job)
    totals = summarize(built)
    scope = job["scope"]
    chimney_sf = chimney_area_sf(scope["chimneyHeightFt"], scope["chimneyWrapGirthFt"])
    return {
        "business": {
            "legalName": pricing["legalName"],
            "contact": pricing.get("contact", ""),
            "phone": pricing.get("phone", ""),
            "email": pricing.get("email", ""),
            "serviceArea": pricing.get("serviceArea", ""),
        },
        "job": {
            "id": job["id"],
            "title": job["title"],
            "clientName": job.get("clientName") or "—",
            "jobSite": job.get("jobSite") or "—",
            "preparedDate": job["preparedDate"],
            "sidingSf": scope["sidingSf"],
            "chimneyHeightFt": scope["chimneyHeightFt"],
            "chimneyWrapGirthFt": scope["chimneyWrapGirthFt"],
            "chimneySf": chimney_sf,
            "windowTrims": scope["windowTrims"],
            "scopeNotes": job.get("scopeNotes", []),
        },
        "rates": {
            "profitMarginPercent": pricing["profitMarginPercent"],
            "materialMarkupPercent": pricing["materialMarkupPercent"],
            "laborHourlyCost": pricing["labor"]["hourlyCost"],
        },
        "lines": [asdict(item) for item in built],
        "totals": totals,
    }
