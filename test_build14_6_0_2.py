import importlib.util
import json
import os
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent


class Build14602StaticTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = (ROOT / 'hub.html').read_text(encoding='utf-8')
        cls.js6 = (ROOT / 'hub-build14-6.js').read_text(encoding='utf-8')
        cls.js5 = (ROOT / 'hub-build14-5.js').read_text(encoding='utf-8')
        cls.css6 = (ROOT / 'hub-build14-6.css').read_text(encoding='utf-8')
        cls.css5 = (ROOT / 'hub-build14-5.css').read_text(encoding='utf-8')
        cls.vault = (ROOT / 'vault' / 'vault_server.py').read_text(encoding='utf-8')

    def test_complete_tag_explorer_surface_exists(self):
        for marker in ('tagExplorerPanel', 'tagExplorerFullList', 'data-tag-kind="topic"', 'data-tag-kind="keyword"', 'data-tag-kind="term"'):
            self.assertIn(marker, self.html)

    def test_tag_sources_include_semantic_fields(self):
        for marker in ('c.tags||[]', 'c.topics||[]', 'c.keywords||[]', 'c.terms||[]'):
            self.assertIn(marker, self.js6)

    def test_tag_explorer_has_full_list_and_related_expansion(self):
        for marker in ('tagKindFilter', 'tagPanelOpen', 'tag-explorer-row', 'relatedExpanded', 'Alle verwandten'):
            self.assertIn(marker, self.js6 + self.html)

    def test_milanote_like_card_types_and_connections_exist(self):
        for marker in ('capture-visual', 'capture-link', 'capture-audio', 'capture-text', 'boardConnectionsHtml'):
            self.assertIn(marker, self.js6)

    def test_progressive_disclosure_hides_context_actions(self):
        self.assertIn('.contextual-action{opacity:0!important', self.css6)
        self.assertIn('.board-node:hover .contextual-action', self.css6)

    def test_production_hidden_bug_is_explicitly_fixed(self):
        self.assertIn('.production-panel[hidden]', self.css5)
        self.assertIn('display:none!important', self.css5)

    def test_production_labels_are_human_facing(self):
        self.assertIn('>Briefing</button>', self.html)
        self.assertIn('>Formate &amp; Inhalte</button>', self.html)

    def test_local_ai_buttons_exist(self):
        self.assertIn('briefAiSuggest', self.html)
        self.assertIn('familyAiSuggest', self.html)
        self.assertIn('suggestBriefLocal', self.js5)
        self.assertIn('suggestFormatsLocal', self.js5)

    def test_local_ai_routes_exist_and_vault_version_bumped(self):
        self.assertIn('/knowledge/content-brief/suggest-local', self.vault)
        self.assertIn('/knowledge/content-family/suggest-local', self.vault)
        self.assertIn('BDVault/3.25.0', self.vault)
        self.assertIn('knowledgeContentAssist', self.vault)

    def test_ai_suggestions_do_not_auto_write(self):
        # UI requires an explicit per-field/all apply or explicit asset "Anlegen" click.
        self.assertIn('data-brief-apply', self.js5)
        self.assertIn('briefApplyAll', self.js5)
        self.assertIn('data-format-create', self.js5)
        self.assertNotIn('await saveBrief();', self.js5[self.js5.index('async function suggestBriefLocal'):self.js5.index('async function ensureFamily')])

    def test_new_local_ai_functions_reuse_local_bridge(self):
        start = self.vault.index('def local_content_brief_suggestion')
        end = self.vault.index('def ai_schema_asset_review')
        block = self.vault[start:end]
        self.assertIn('ai_chat_json', block)
        self.assertNotIn('api.openai.com', block)
        self.assertNotIn('api.anthropic.com', block)

    def test_cache_busters_are_14602(self):
        self.assertIn('hub-build14-5.js?v=20260929-build14-7-1', self.html)
        self.assertIn('hub-build14-6.js?v=20260929-build14-6-0-2', self.html)


class Build14602FunctionalLocalAITests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory(prefix='bd14602-test-')
        cls.old_dir = os.environ.get('BD_VAULT_DIR')
        os.environ['BD_VAULT_DIR'] = cls.tmp.name
        spec = importlib.util.spec_from_file_location('vault14602_test', ROOT / 'vault' / 'vault_server.py')
        cls.v = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(cls.v)
        cls.v.init_db()
        cls.key = os.urandom(32)
        now = cls.v.utcnow()
        with cls.v.db() as con:
            con.execute(
                "INSERT INTO knowledge_concepts(id,status,title_enc,core_enc,tags_enc,created_at,updated_at) VALUES (?,?,?,?,?,?,?)",
                ('c1','concept',cls.v.enc_text(cls.key,'Grenzen vs Kontrolle'),cls.v.enc_text(cls.key,'Kontrolle kann Unsicherheit kurzfristig senken, aber Beziehungssicherheit beschädigen.'),cls.v.enc_text(cls.key,json.dumps(['Grenzen','Kontrolle'],ensure_ascii=False)),now,now)
            )
            con.execute(
                "INSERT INTO knowledge_production_projects(id,concept_id,stage,title_enc,created_at,updated_at) VALUES (?,?,?,?,?,?)",
                ('p1','c1','ready',cls.v.enc_text(cls.key,'Grenzen vs Kontrolle'),now,now)
            )
        def fake(system, user, schema, max_tokens=1000, requested_model='', progress=None):
            name = schema['json_schema']['name']
            if name == 'content_brief_suggestion':
                return ({'goal':'Orientierung geben','question':'Wie unterscheiden sich Grenzen und Kontrolle?','problem':'Unsicherheit führt zu Kontrollimpulsen','audience':'Menschen in Beziehungen','tone':['verständlich','empathisch'],'centralPoints':['Grenzen beschreiben eigenes Handeln'],'mustInclude':['Beispiele'],'mustNotClaim':['Keine Diagnose'],'openQuestions':['Welche Rolle spielt Bindung?'],'cta':'Eigene Muster reflektieren'}, 'local-test', .1, 0)
            if name == 'content_format_suggestions':
                return ({'suggestions':[{'title':'Grenzen vs Kontrolle','contentType':'article','channel':'website','accessType':'public','rationale':'Gut für eine differenzierte Erklärung'}]}, 'local-test', .1, 0)
            raise AssertionError(name)
        cls.v.ai_chat_json = fake

    @classmethod
    def tearDownClass(cls):
        if cls.old_dir is None:
            os.environ.pop('BD_VAULT_DIR', None)
        else:
            os.environ['BD_VAULT_DIR'] = cls.old_dir
        cls.tmp.cleanup()

    def test_brief_suggestion_returns_structured_local_result(self):
        result = self.v.local_content_brief_suggestion(self.key, 'p1')
        self.assertEqual(result['model'], 'local-test')
        self.assertEqual(result['suggestion']['goal'], 'Orientierung geben')
        self.assertIn('verständlich', result['suggestion']['tone'])

    def test_format_suggestions_return_asset_metadata(self):
        result = self.v.local_content_format_suggestions(self.key, 'p1')
        self.assertEqual(result['model'], 'local-test')
        self.assertEqual(result['suggestions'][0]['contentType'], 'article')
        self.assertEqual(result['suggestions'][0]['accessType'], 'public')


if __name__ == '__main__':
    unittest.main()
