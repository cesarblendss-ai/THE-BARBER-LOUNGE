"""Score a HIPAA readiness assessment. No PHI — answers and org metadata only."""

from __future__ import annotations

from typing import Any

POINTS = {"yes": 2, "partial": 1, "no": 0}


def score_assessment(catalog: dict[str, Any], answers: dict[str, str]) -> dict[str, Any]:
    sections_out: list[dict[str, Any]] = []
    total_earned = 0
    total_possible = 0
    gaps: list[dict[str, Any]] = []
    answered = 0
    scorable = 0

    for section in catalog.get("sections", []):
        earned = 0
        possible = 0
        section_answered = 0
        items = []
        for q in section.get("questions", []):
            qid = q["id"]
            raw = (answers.get(qid) or "").strip().lower()
            if raw in POINTS:
                scorable += 1
                section_answered += 1
                answered += 1
                pts = POINTS[raw]
                max_pts = 2
                earned += pts
                possible += max_pts
                if raw in ("no", "partial"):
                    gaps.append(
                        {
                            "id": qid,
                            "section": section["id"],
                            "sectionTitle": section["title"],
                            "text": q["text"],
                            "help": q.get("help", ""),
                            "priority": q.get("priority", "medium"),
                            "answer": raw,
                        }
                    )
            elif raw == "na":
                answered += 1
                items.append({"id": qid, "answer": raw, "points": None, "max": 2})
                continue
            items.append({"id": qid, "answer": raw or None, "points": POINTS.get(raw), "max": 2})

        total_earned += earned
        total_possible += possible
        pct = round((earned / possible) * 100) if possible else None
        sections_out.append(
            {
                "id": section["id"],
                "title": section["title"],
                "earned": earned,
                "possible": possible,
                "percent": pct,
                "answered": section_answered,
                "total": len(section.get("questions", [])),
            }
        )

    total_questions = sum(len(s.get("questions", [])) for s in catalog.get("sections", []))
    percent = round((total_earned / total_possible) * 100) if total_possible else 0
    priority_rank = {"high": 0, "medium": 1, "low": 2}
    gaps.sort(key=lambda g: (priority_rank.get(g["priority"], 9), 0 if g["answer"] == "no" else 1))

    return {
        "percent": percent,
        "earned": total_earned,
        "possible": total_possible,
        "band": band_for(percent, total_possible),
        "sections": sections_out,
        "gaps": gaps,
        "answered": answered,
        "scorable": scorable,
        "totalQuestions": total_questions,
        "complete": answered >= total_questions and total_questions > 0,
    }


def band_for(percent: int, possible: int) -> dict[str, str]:
    if possible <= 0:
        return {"id": "empty", "label": "Not started", "blurb": "Answer the checklist to see a readiness score."}
    if percent >= 90:
        return {
            "id": "strong",
            "label": "Strong baseline",
            "blurb": "Most required practices are in place. Close leftover gaps and keep the yearly review cadence.",
        }
    if percent >= 70:
        return {
            "id": "moderate",
            "label": "Moderate — close the high gaps",
            "blurb": "A workable start, but high-priority No/Partial items will show up in an OCR inquiry.",
        }
    if percent >= 50:
        return {
            "id": "weak",
            "label": "Weak — treat this as a project",
            "blurb": "Core Privacy and Security Rule work is missing. Assign owners this week, starting with risk analysis and BAAs.",
        }
    return {
        "id": "critical",
        "label": "Critical — do not claim HIPAA-ready",
        "blurb": "Do not tell patients or partners this practice is HIPAA compliant. Start with a named official, BAAs, and a written risk analysis.",
    }
