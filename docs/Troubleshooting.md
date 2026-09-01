# Developer Troubleshooting & Common Issue Solutions

## 1. Database Connection Errors

### Error: `Table 'kintsugi_db.password_reset_requests' doesn't exist`
- **Cause**: The backend database engine was started prior to creating new security tables.
- **Fix**: Run the table creation script:
  ```bash
  python -c "from app.db.session import engine; from app.db.base_class import Base; import app.models; Base.metadata.create_all(bind=engine)"
  ```

---

## 2. Android Connection & Network Errors

### Error: `Failed to connect to /127.0.0.1:8000`
- **Cause**: ADB reverse port forwarding is not active on the connected physical device or emulator.
- **Fix**: Run:
  ```bash
  adb reverse tcp:8000 tcp:8000
  ```

---

## 3. Web & Node Build Errors

### Error: `Module not found: Error: Can't resolve 'lucide-react'`
- **Cause**: Uninstalled node package dependencies.
- **Fix**: Run `npm install` inside the `web/` directory.
