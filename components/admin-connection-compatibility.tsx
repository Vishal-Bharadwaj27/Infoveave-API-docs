// Which ConnectionType goes with which CredentialType for the
// Administration service's POST /api/v10/core/connections.
//
// The API itself does not enforce any of this — ConnectionType and
// CredentialType are both free strings, and the validator only checks
// they're non-empty. The pairings below come from FuseData's own connection
// models, which are what actually read and use these same connections.
type Row = { types: string[]; credentials: string[]; note?: string };

const rows: Row[] = [
  {
    types: ['Database'],
    credentials: ['None'],
    note: 'Configuration is a plain connection string (host, port, username, password, database). Not enforced by the API; this is the only pairing that matches the Configuration shape.',
  },
  {
    types: ['GoogleBigQuery'],
    credentials: ['AuthCode', 'ServiceAccount'],
    note: 'AuthCode is the default. ServiceAccount needs Configuration to include the filename of a service-account JSON already uploaded for the tenant.',
  },
  {
    types: ['GoogleCloudStorage'],
    credentials: ['AuthCode'],
    note: 'ServiceAccount is not offered for this type, even though it looks similar to BigQuery.',
  },
  {
    types: ['GitHub', 'GoogleAnalytics', 'Jira', 'Shopify'],
    credentials: ['AuthCode'],
    note: 'AuthCode connections are normally produced by GET oauth/authorize → POST {connectionType}/authorize-callback, not posted directly here. ClientCredentials is not offered for any of these four.',
  },
  {
    types: ['Salesforce'],
    credentials: ['AuthCode', 'ClientCredentials'],
    note: 'AuthCode is the default. ClientCredentials is for server-to-server use; Configuration should carry clientId, clientSecret, and authUrl.',
  },
  {
    types: ['PayPal'],
    credentials: ['ClientCredentials'],
    note: 'ClientCredentials only — AuthCode is not offered for this type.',
  },
  {
    types: ['Braintree'],
    credentials: ['ClientCredentials'],
    note: 'Configuration should carry clientId, clientSecret, and authUrl, matching a client-credentials style connection.',
  },
  {
    types: ['GoogleDrive', 'Gmail', 'OneDrive', 'Dropbox', 'Box', 'HubSpot', 'Zoho', 'Slack', 'Monday'],
    credentials: ['AuthCode'],
    note: 'These are OAuth-capable, but only AuthCode is confirmed for them — treat ClientCredentials as unsupported for this group.',
  },
  {
    types: ['Api', 'GraphQL', 'Ftp', 'Email', 'S3', 'Azure'],
    credentials: ['None', 'ClientCredentials'],
    note: 'Credentials travel inside Configuration. ClientCredentials is for endpoints that speak OAuth client-credentials.',
  },
  {
    types: ['Sap', 'Kafka', 'OpenAI', 'Claude', 'Gemini'],
    credentials: ['None'],
    note: 'Use None only. AuthCode or ClientCredentials will pass creation but fail silently the first time the connection is actually used.',
  },
];

export function AdminConnectionCompatibility() {
  return (
    <section className="mt-10 text-sm">
      <div className="mt-5 flex flex-col gap-4">
        <div className="overflow-hidden rounded-xl border">
          <div className="border-b bg-fd-secondary/60 px-4 py-2.5">
            <span className="font-mono font-medium text-fd-primary">
              POST /api/v10/core/connections
            </span>
            <p className="mt-0.5 text-xs text-fd-muted-foreground">
              ConnectionType → CredentialType
            </p>
          </div>
          {rows.map((r, i) => (
            <div
              key={i}
              className="grid grid-cols-1 gap-x-4 gap-y-1 border-t px-4 py-2.5 first:border-t-0 md:grid-cols-[1fr_1fr]"
            >
              <span className="font-mono">{r.types.join(', ')}</span>
              <span className="font-mono text-fd-muted-foreground">
                {r.credentials.join(', ')}
                {r.note && (
                  <span className="font-sans block text-xs italic mt-1">{r.note}</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
