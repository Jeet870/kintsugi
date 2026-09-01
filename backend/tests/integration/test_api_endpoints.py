def test_health_probes(client):
    res_live = client.get("/health/live")
    assert res_live.status_code == 200
    assert res_live.json()["status"] == "healthy"

    res_metrics = client.get("/metrics")
    assert res_metrics.status_code == 200
    assert "kintsugi_up 1" in res_metrics.text


def test_auth_registration_and_login(client):
    reg_resp = client.post("/api/v1/auth/register", json={
        "name": "Integration User",
        "email": "intuser@example.com",
        "password": "Password123!",
    })
    assert reg_resp.status_code == 201
    assert reg_resp.json()["email"] == "intuser@example.com"

    login_resp = client.post("/api/v1/auth/login", data={
        "username": "intuser@example.com",
        "password": "Password123!",
    })
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.json()


def test_content_and_emergency_routes(client):
    quote_resp = client.get("/api/v1/content/quote")
    assert quote_resp.status_code == 200

    tips_resp = client.get("/api/v1/content/tips")
    assert tips_resp.status_code == 200

    helpline_resp = client.get("/api/v1/emergency/helplines?country_code=IN")
    assert helpline_resp.status_code == 200

    calming_resp = client.get("/api/v1/emergency/calming-tips")
    assert calming_resp.status_code == 200
    assert len(calming_resp.json()) >= 3


def test_auth_login_invalid_credentials_returns_401(client):
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "invaliduser@example.com",
        "password": "WrongPassword123!",
    })
    assert login_resp.status_code == 401
    payload = login_resp.json()
    assert payload["success"] is False
    assert payload["error"]["code"] == "UNAUTHORIZED"


def test_mobile_content_and_profile_endpoints(client):
    # Register & Login
    client.post("/api/v1/auth/register", json={
        "name": "Mobile User",
        "email": "mobileuser@example.com",
        "password": "Password123!",
    })
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "mobileuser@example.com",
        "password": "Password123!",
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Test /content/motivation
    motiv_resp = client.get("/api/v1/content/motivation", headers=headers)
    assert motiv_resp.status_code == 200
    data = motiv_resp.json()
    assert "quote" in data
    assert "author" in data
    assert "affirmations" in data
    assert "self_care_tips" in data

    # Test /content/affirmations
    aff_resp = client.get("/api/v1/content/affirmations", headers=headers)
    assert aff_resp.status_code == 200
    assert isinstance(aff_resp.json(), list)

    # Test /profile/me
    me_resp = client.get("/api/v1/profile/me", headers=headers)
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "mobileuser@example.com"
    assert "streak_days" in me_resp.json()

    # Test /profile/streak
    streak_resp = client.get("/api/v1/profile/streak", headers=headers)
    assert streak_resp.status_code == 200
    assert "current_streak" in streak_resp.json()

    # Test /profile/achievements
    ach_resp = client.get("/api/v1/profile/achievements", headers=headers)
    assert ach_resp.status_code == 200
    assert isinstance(ach_resp.json(), list)

    # Test /mood/entries and /mood/stats
    mood_post = client.post("/api/v1/mood/entries", json={
        "mood_type": "calm",
        "mood_score": 4,
        "note": "Feeling peaceful today"
    }, headers=headers)
    assert mood_post.status_code == 201
    assert mood_post.json()["mood_type"] == "calm"

    stats_resp = client.get("/api/v1/mood/stats", headers=headers)
    assert stats_resp.status_code == 200
    assert stats_resp.json()["total_entries"] >= 1


