import unittest

from analyze_catalog import delete_stale_rows_sql


class StaleProjectCleanupTests(unittest.TestCase):
    def test_cleanup_keeps_only_current_public_slugs(self):
        statement = delete_stale_rows_sql({"nexora", "dark-legion"})
        self.assertEqual(
            statement,
            "DELETE FROM public_projects WHERE slug NOT IN ('dark-legion', 'nexora');",
        )

    def test_cleanup_rejects_empty_catalog(self):
        with self.assertRaisesRegex(ValueError, "empty public catalog"):
            delete_stale_rows_sql(set())


if __name__ == "__main__":
    unittest.main()
