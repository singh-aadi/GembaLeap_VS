from gembaleap_agents.canonical import GENESIS_HASH, canonical_json, chain_hash, sha256_hex


def test_matches_typescript_fixture(fixture):
    data = fixture("canonical.json")
    assert canonical_json(data["input"]) == data["canonical"]
    assert sha256_hex(data["canonical"]) == data["sha256"]


def test_integral_floats_print_like_javascript():
    assert canonical_json({"b": 2.0, "a": [1.5, 3.0]}) == '{"a":[1.5,3],"b":2}'


def test_chain_hash_changes_with_the_entry():
    entry = {"seq": 1, "action": "report.publish"}
    assert chain_hash(GENESIS_HASH, entry) != chain_hash(GENESIS_HASH, {**entry, "seq": 2})
