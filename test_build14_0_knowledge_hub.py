import sqlite3
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent


class KnowledgeHubBuild140Tests(unittest.TestCase):
    def test_migration_is_idempotent_and_has_required_columns(self):
        sql = (ROOT / "database/build14-0-knowledge-hub.sql").read_text(encoding="utf-8")
        db = sqlite3.connect(":memory:")
        db.executescript(sql)
        db.executescript(sql)
        columns = {row[1] for row in db.execute("PRAGMA table_info(knowledge_items)")}
        self.assertTrue({"content_html", "slug", "published_at", "visible_until", "seo_description"} <= columns)
        self.assertEqual(db.execute("SELECT COUNT(*) FROM knowledge_item_versions").fetchone()[0], 0)

    def test_future_article_is_not_public(self):
        sql = (ROOT / "database/build14-0-knowledge-hub.sql").read_text(encoding="utf-8")
        db = sqlite3.connect(":memory:")
        db.executescript(sql)
        db.execute("INSERT INTO knowledge_items(item_type,status,title,slug,content_html,published_at) VALUES('article','published','Zukunft','zukunft','<p>Text</p>',datetime('now','+1 day'))")
        query = "SELECT COUNT(*) FROM knowledge_items WHERE status='published' AND datetime(published_at)<=CURRENT_TIMESTAMP"
        self.assertEqual(db.execute(query).fetchone()[0], 0)

    def test_publication_and_admin_surface_are_wired(self):
        worker = (ROOT / "cloudflare-worker/worker.js").read_text(encoding="utf-8")
        hub = (ROOT / "hub.html").read_text(encoding="utf-8")
        admin = (ROOT / "admin.html").read_text(encoding="utf-8")
        for marker in ("/admin/knowledge/save", "/admin/knowledge/action", "/wissen/", "sanitizeKnowledgeHtml"):
            self.assertIn(marker, worker)
        for marker in ("contenteditable=\"true\"", "publishDateInput", "editorialPlan"):
            self.assertIn(marker, hub)
        self.assertIn('href="hub.html"', admin)
        self.assertNotIn('data-view="knowledge"', admin)


if __name__ == "__main__":
    unittest.main()
