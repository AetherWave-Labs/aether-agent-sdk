'use client';

import { useEffect, useState } from 'react';
import { fetchAuditLog, AuditEvent } from '../lib/api';

const EVENT_COLORS: Record<string, string> = {
  POLICY_CHECK: 'bg-green-100 text-green-800',
  POLICY_REJECTION: 'bg-red-100 text-red-800',
  SIMULATION_START: 'bg-blue-100 text-blue-800',
  SIMULATION_COMPLETE: 'bg-blue-100 text-blue-800',
  SIGNING: 'bg-indigo-100 text-indigo-800',
  SUBMISSION: 'bg-purple-100 text-purple-800',
  CONFIRMATION: 'bg-green-100 text-green-800',
  FAILURE: 'bg-red-100 text-red-800',
  UNAUTHORIZED: 'bg-orange-100 text-orange-800',
  RATE_LIMIT: 'bg-yellow-100 text-yellow-800',
};

export default function AuditPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLog()
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Audit Log</h2>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Events ({events.length})</h3>
        </div>
        <div className="divide-y">
          {loading ? (
            <div className="px-6 py-8 text-center text-gray-500">Loading...</div>
          ) : events.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">No audit events yet</div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${EVENT_COLORS[event.eventType] || 'bg-gray-100'}`}>
                      {event.eventType}
                    </span>
                    <span className="text-sm text-gray-500">{event.agentId.slice(0, 8)}...</span>
                  </div>
                  <span className="text-sm text-gray-500">{new Date(event.timestamp).toLocaleString()}</span>
                </div>
                <pre className="mt-2 text-xs text-gray-600 bg-gray-50 rounded p-2 overflow-x-auto">
                  {JSON.stringify(event.details, null, 2)}
                </pre>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
