// Which ConnectionType goes with which CredentialType for the
// Administration service's POST /api/v10/core/connections.
//
// Verified against, in Infoveave-vNext:
// - Modules/Connection/Models/ApiModels.cs:27-34 ConnectionCreateRequest (all 4 fields required, all free strings)
// - Modules/Connection/Validators/ConnectionValidators.cs:8-23 (only checks non-empty — no cross-validation of pairing)
// - Modules/Connection/Handlers/ConnectionsHandler.cs:93-133 CreateConnection (stores both fields as-is, no enum parsing)
// - Modules/Connection/Handlers/ConnectionsHandler.cs:44 (ConnectionType aliased to MetadataModels.ConnectionType, 43 values)
// - Modules/Connection/Handlers/ConnectionsHandler.cs:623 ClientCredentials branch, :664 ServiceAccount branch (in ValidateOAuthCredentials)
// - Modules/Connection/Handlers/ConnectionsHandler.cs:766-774 (GetConnectionDetails parses ConnectionType against the SMALLER
//   OAuthEnums.ConnectionType, 39 values, only when CredentialType is AuthCode or ClientCredentials — throws if the value
//   isn't one of those 39; caught silently, but token handling fails for that connection)
// - ServiceModels/.../OAuthModels/OAuthEnums.cs:5-45 (the 39-value ConnectionType actually used by the OAuth/refresh code path)
// - ServiceModels/.../MetadataModels/ConnectionTypeEnum.cs:3-48 (the 43-value ConnectionType the create endpoint stores against)
type Row = { types: string[]; credentials: string[]; note?: string };

const rows: Row[] = [
  {
    types: ['Database'],
    credentials: ['None'],
    // note: 'Configuration is a SqlConnection JSON (host/port/username/password/database) — see StaticHelper.cs:21 and ConnectionsHandler.cs:731 for the special-casing. Not enforced by the API; this is the conventional pairing.',
  },
  {
    types: ['GoogleBigQuery', 'GoogleCloudStorage'],
    credentials: ['ServiceAccount'],
    // note: 'Configuration must include serviceAccountDetails — the filename of a service-account JSON already uploaded under the tenant\u2019s Certificates folder (ConnectionsHandler.cs:664-681). Not restricted to these two types by code, but this is the only combination the validation endpoint actually knows how to check.',
  },
  {
    types: [
      'Salesforce', 'GoogleDrive', 'Gmail', 'OneDrive', 'Dropbox', 'Box',
      'HubSpot', 'Zoho', 'Jira', 'Slack', 'Shopify', 'Monday',
    ],
    credentials: ['AuthCode', 'ClientCredentials'],
    // note: 'These 12 are the OAuth-capable values in OAuthEnums.ConnectionType. AuthCode connections are normally produced by GET oauth/authorize \u2192 POST {connectionType}/authorize-callback, not posted directly here. ClientCredentials is for server-to-server; Configuration should match OAuthConnectionModel (clientId, clientSecret, authUrl). Monday and Shopify skip the missing-refresh-token warning (ConnectionsHandler.cs:61).',
  },
  {
    types: ['Api', 'GraphQL', 'Ftp', 'Email', 'S3', 'Azure'],
    credentials: ['None', 'ClientCredentials'],
    // note: 'Credentials travel inside Configuration. ClientCredentials is safe for these — all 6 exist in both ConnectionType enums used by the create and refresh paths.',
  },
  {
    types: ['Sap', 'Kafka', 'OpenAI', 'Claude', 'Gemini'],
    credentials: ['None'],
    // note: 'Use None only. These 5 exist in the 43-value ConnectionType this endpoint stores against, but NOT in the 39-value OAuthEnums.ConnectionType the refresh/details path parses against — pairing them with AuthCode or ClientCredentials passes creation but throws (silently caught) the first time the connection\u2019s details are resolved for use.',
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
