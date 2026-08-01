import logging

logger = logging.getLogger("aura_fit.sync.resolver")

class ConflictResolver:
    @staticmethod
    def resolve(client_payload: dict, client_version: int, server_record: dict) -> tuple[bool, dict]:
        """
        Returns (is_conflict, resolved_payload).
        If client_version < server_record['version'], it's a conflict.
        Currently, server wins on conflict, but we merge non-overlapping fields.
        """
        server_version = server_record.get('version', 1)
        if client_version < server_version:
            logger.warning("Conflict detected!")
            # Basic merge: keep server data, apply client payload keys only if missing
            merged = server_record.copy()
            for k, v in client_payload.items():
                if k not in merged:
                    merged[k] = v
            return True, merged
        return False, client_payload
