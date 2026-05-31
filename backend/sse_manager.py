import asyncio
import json

class SSEManager:
    def __init__(self):
        self.listeners: list[asyncio.Queue] = []
        self._loop = None

    async def listen(self):
        if self._loop is None:
            self._loop = asyncio.get_running_loop()
            
        q = asyncio.Queue()
        self.listeners.append(q)
        try:
            while True:
                event = await q.get()
                yield event
        finally:
            self.listeners.remove(q)

    def broadcast_sync(self, message_dict: dict):
        """A safe method to push events from your standard synchronous worker threads."""
        if not self.listeners or self._loop is None:
            return
            
        try:
            for q in self.listeners:
                self._loop.call_soon_threadsafe(q.put_nowait, json.dumps(message_dict))
        except RuntimeError:
            pass 

notifier = SSEManager()