// Which ConnectionType goes with which CredentialType for the
// Administration service's POST /api/v10/core/connections.
//
// Source (read-only, in Infoveave-vNext):
// - Modules/Connection/Models/ApiModels.cs:27-34 ConnectionCreateRequest
//   (Name, Configuration, ConnectionType, CredentialType — all required)
// - Modules/Connection/Validators/ConnectionValidators.cs:8-24 (all four required)
// - Modules/Connection/Handlers/ConnectionsHandler.cs:93-131 CreateConnection,
//   :623 ClientCredentials branch, :664 ServiceAccount branch,
//   :766-767 AuthCode/ClientCredentials OAuth refresh, :490-501 OAuth type parsing
// - ServiceModels/.../MetadataModels/ConnectionTypeEnum.cs:3-48 (ConnectionType values)
// - ServiceModels/.../FuseDataModels/CommonModels/Consolidated.cs:802-808 (CredentialType values)
type Row = { types: string[]; credentials: string[]; note?: string };

const rows: Row[] = [
  {
    types: ['Database'],
    credentials: ['None'],
    note: 'Plain DB connection; Configuration holds the connection string (StaticHelper.cs:21, ConnectionsHandler.cs:731).',
  },
  {
    types: ['GoogleBigQuery', 'GoogleCloudStorage'],
    credentials: ['ServiceAccount'],
    note: 'Google services use a service account key (ConnectionsHandler.cs:664).',
  },
  {
    types: [
      'Salesforce', 'GoogleDrive', 'Gmail', 'OneDrive', 'Dropbox', 'Box',
      'SharePoint', 'HubSpot', 'Zoho', 'Jira', 'Slack', 'Shopify', 'Monday',
    ],
    credentials: ['AuthCode', 'ClientCredentials'],
    note: 'OAuth-capable SaaS types; AuthCode stores refresh tokens, ClientCredentials is server-to-server (ConnectionsHandler.cs:623,766-767). Monday and Shopify skip the refresh-token warning (ConnectionsHandler.cs:61).',
  },
  {
    types: ['Api', 'GraphQL', 'Ftp', 'Email', 'S3', 'Azure', 'Sap', 'Kafka', 'OpenAI', 'Claude', 'Gemini'],
    credentials: ['None', 'ClientCredentials'],
    note: 'Credentials travel inside Configuration; pick ClientCredentials only when the endpoint speaks OAuth client-credentials.',
  },
];

export function AdminConnectionCompatibility() {
  return (
    <section className="mt-10 text-sm">
      <h2 className="text-2xl font-semibold tracking-tight">
        Which options go together
      </h2>
      <p className="mt-2 text-fd-muted-foreground">
        The API requires all four fields but does not cross-check the pairing,
        so an odd combination such as Database with AuthCode is accepted and
        fails later. The table below shows the pairings the handler code
        actually supports.
      </p>
      <h3 className="mt-6 text-lg font-semibold">Workflow</h3>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-fd-muted-foreground">
        <li>Create with this endpoint; the response returns the connection Id with secrets redacted.</li>
        <li>Discover data with GET {'{id}'}/tables, then POST {'{id}'}/get-columns.</li>
        <li>Preview with POST {'{id}'}/table/get-sample-data, query with POST {'{id}'}/execute-query.</li>
        <li>OAuth types: GET oauth/authorize, then POST {'{connectionType}'}/authorize-callback, then re-check with POST oauth/{'{id}'}/validate-credentials.</li>
        <li>Pin a working connection with PATCH {'{id}'}/set-as-default.</li>
      </ol>
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
