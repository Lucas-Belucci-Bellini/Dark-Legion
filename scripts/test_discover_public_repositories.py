import unittest

from discover_public_repositories import discover_catalog, slugify


class DiscoverCatalogTests(unittest.TestCase):
    def test_only_public_repositories_owned_by_profile_are_added(self):
        existing = []
        repositories = [
            {
                "name": "NEXORA",
                "private": False,
                "owner": {"login": "Lucas-Belucci-Bellini"},
                "language": "Rust",
                "description": "Voxel engine",
                "homepage": "https://example.com",
            },
            {
                "name": "SECRET-PROJECT",
                "private": True,
                "owner": {"login": "Lucas-Belucci-Bellini"},
                "language": "Rust",
            },
            {
                "name": "Someone-Else",
                "private": False,
                "owner": {"login": "someone-else"},
            },
        ]

        catalog = discover_catalog(existing, repositories)

        self.assertEqual([item["name"] for item in catalog], ["NEXORA"])
        self.assertEqual(catalog[0]["category"], "Engenharia & Sistemas")
        self.assertEqual(catalog[0]["website_url"], "https://example.com")

    def test_existing_curated_metadata_is_preserved(self):
        existing = [{
            "slug": "nexora",
            "name": "NEXORA",
            "category": "Custom category",
            "category_label": "Custom label",
            "description": "Curated description",
            "repository_url": "https://github.com/Lucas-Belucci-Bellini/NEXORA",
            "website_url": None,
            "status": "Ativo",
            "featured": True,
            "marketing_priority": 99,
        }]
        repositories = [{
            "name": "NEXORA",
            "private": False,
            "owner": {"login": "Lucas-Belucci-Bellini"},
            "language": "Rust",
            "description": "Different GitHub description",
            "homepage": "https://nexora.example",
        }]

        catalog = discover_catalog(existing, repositories)

        self.assertEqual(len(catalog), 1)
        self.assertEqual(catalog[0]["description"], "Curated description")
        self.assertEqual(catalog[0]["category"], "Custom category")
        self.assertTrue(catalog[0]["featured"])
        self.assertEqual(catalog[0]["marketing_priority"], 99)
        self.assertEqual(catalog[0]["website_url"], "https://nexora.example")

    def test_stale_private_or_deleted_owned_repo_is_removed(self):
        existing = [{
            "slug": "old-secret",
            "name": "Old secret",
            "category": "Software",
            "category_label": "Software",
            "description": "Previously public entry",
            "repository_url": "https://github.com/Lucas-Belucci-Bellini/Old-Secret",
            "website_url": None,
            "status": "Ativo",
            "featured": False,
            "marketing_priority": 0,
        }]

        self.assertEqual(discover_catalog(existing, []), [])

    def test_slugify_handles_punctuation(self):
        self.assertEqual(slugify("Ativ.-Geren-Proj"), "ativ-geren-proj")


if __name__ == "__main__":
    unittest.main()
