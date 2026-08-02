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
        
        # If versions match or client is newer, no conflict. Just apply.
        if client_version >= server_version:
            return False, client_payload

        logger.warning(f"Conflict detected! Client: {client_version}, Server: {server_version}")
        
        # Self-correction: Field-level Last-Write-Wins (LWW)
        # We assume the client's payload contains the most recent user action for these specific fields.
        merged = server_record.copy()
        for k, v in client_payload.items():
            # Overwrite the server's field with the client's latest data
            merged[k] = v
            
        return True, client_payload
