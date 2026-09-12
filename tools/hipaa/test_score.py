#!/usr/bin/env python3
"""Unit tests for HIPAA readiness scoring. Run: python3 test_score.py"""

from __future__ import annotations

import json
import sys
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from score import band_for, score_assessment  # noqa: E402


def load_catalog() -> dict:
    return json.loads((HERE / "data" / "questions.json").read_text(encoding="utf-8"))


class ScoreTests(unittest.TestCase):
    def setUp(self) -> None:
        self.catalog = load_catalog()
        self.qids = [q["id"] for s in self.catalog["sections"] for q in s["questions"]]

    def test_catalog_has_expected_shape(self) -> None:
        self.assertGreaterEqual(len(self.catalog["sections"]), 6)
        self.assertGreaterEqual(len(self.qids), 20)
        self.assertEqual(len(self.qids), len(set(self.qids)))

    def test_empty_answers_are_zero_not_complete(self) -> None:
        result = score_assessment(self.catalog, {})
        self.assertEqual(result["percent"], 0)
        self.assertEqual(result["earned"], 0)
        self.assertFalse(result["complete"])
        self.assertEqual(result["band"]["id"], "empty")

    def test_all_yes_is_100_and_complete(self) -> None:
        answers = {qid: "yes" for qid in self.qids}
        result = score_assessment(self.catalog, answers)
        self.assertEqual(result["percent"], 100)
        self.assertTrue(result["complete"])
        self.assertEqual(result["band"]["id"], "strong")
        self.assertEqual(result["gaps"], [])

    def test_na_excluded_from_denominator(self) -> None:
        answers = {qid: "yes" for qid in self.qids}
        answers[self.qids[0]] = "na"
        result = score_assessment(self.catalog, answers)
        self.assertEqual(result["percent"], 100)
        self.assertEqual(result["possible"], (len(self.qids) - 1) * 2)

    def test_partial_and_no_create_prioritized_gaps(self) -> None:
        answers = {qid: "yes" for qid in self.qids}
        answers["npp_given"] = "no"
        answers["auto_logoff"] = "partial"
        result = score_assessment(self.catalog, answers)
        self.assertEqual(len(result["gaps"]), 2)
        self.assertEqual(result["gaps"][0]["id"], "npp_given")
        self.assertEqual(result["gaps"][0]["priority"], "high")
        self.assertLess(result["percent"], 100)

    def test_bands(self) -> None:
        self.assertEqual(band_for(95, 10)["id"], "strong")
        self.assertEqual(band_for(75, 10)["id"], "moderate")
        self.assertEqual(band_for(55, 10)["id"], "weak")
        self.assertEqual(band_for(20, 10)["id"], "critical")
        self.assertEqual(band_for(0, 0)["id"], "empty")


if __name__ == "__main__":
    unittest.main()
