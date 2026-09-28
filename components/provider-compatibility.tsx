// Which auth modes make sense for each provider. Names are the enum names used
// by ConnectionCategory / ConnectionProvider / ConnectionAuthMode.
//
// `accepts` is what the API validates (the whole category list). `fits` is the
// subset that matches the provider's own settings. That subset is a
// recommendation, not something the API enforces.
type Row = { providers: string[]; fits: string[]; note?: string };
type Category = { name: string; accepts: string[]; rows: Row[] };

const categories: Category[] = [
  {
    name: 'Database',
    accepts: ['ConnectionString', 'Basic', 'BearerToken'],
    rows: [
      { providers: ['Sqlite', 'DuckDb', 'MongoDb'], fits: ['ConnectionString'] },
      { providers: ['SqlServer', 'Oracle', 'MySql', 'Postgres'], fits: ['ConnectionString', 'Basic'] },
      { providers: ['ClickHouse', 'Cassandra', 'Snowflake'], fits: ['Basic'] },
      { providers: ['Databricks'], fits: ['BearerToken'] },
      { providers: ['BigQuery'], fits: [], note: 'Uses a service account JSON, which Database does not allow.' },
      { providers: ['Athena'], fits: [], note: 'Uses access keys, which Database does not allow.' },
      { providers: ['AzureDocumentDb'], fits: [], note: 'Uses an API key, which Database does not allow.' },
    ],
  },
  {
    name: 'ObjectStorage',
    accepts: [
      'AwsCredentials', 'AwsRoleAssumption', 'AzureServicePrincipal',
      'AzureManagedIdentity', 'GcpServiceAccount', 'ConnectionString',
    ],
    rows: [
      { providers: ['S3'], fits: ['AwsCredentials', 'AwsRoleAssumption'] },
      { providers: ['S3Compatible'], fits: ['AwsCredentials'] },
      { providers: ['AzureBlob'], fits: ['ConnectionString', 'AzureServicePrincipal', 'AzureManagedIdentity'] },
      { providers: ['AzureDataLakeGen2'], fits: ['AzureServicePrincipal', 'AzureManagedIdentity'] },
      { providers: ['GoogleCloudStorage'], fits: ['GcpServiceAccount'] },
    ],
  },
  {
    name: 'FileTransfer',
    accepts: ['Basic', 'BearerToken'],
    rows: [
      { providers: ['Ftp', 'Sftp', 'Smb'], fits: ['Basic'] },
      { providers: ['WebDav'], fits: ['Basic', 'BearerToken'] },
    ],
  },
  {
    name: 'DocumentStorage',
    accepts: ['OAuthAuthorizationCode', 'ServiceAccountJson'],
    rows: [
      { providers: ['GoogleDrive'], fits: ['OAuthAuthorizationCode', 'ServiceAccountJson'] },
      { providers: ['OneDrive', 'SharePoint', 'Dropbox', 'Box'], fits: ['OAuthAuthorizationCode'] },
    ],
  },
  {
    name: 'Email',
    accepts: ['Basic', 'ApiKey', 'OAuthAuthorizationCode (Exchange, Gmail only)'],
    rows: [
      { providers: ['Smtp', 'Imap', 'Pop3'], fits: ['Basic'] },
      { providers: ['Mailgun'], fits: ['ApiKey'] },
      { providers: ['Exchange', 'Gmail'], fits: ['OAuthAuthorizationCode'] },
    ],
  },
  {
    name: 'GenericApi',
    accepts: ['None', 'ApiKey', 'BearerToken', 'Basic', 'CustomHeaders'],
    rows: [
      { providers: ['RestApi', 'GraphQl', 'Http'], fits: ['ApiKey', 'BearerToken', 'None', 'CustomHeaders'] },
      { providers: ['OData'], fits: ['Basic', 'BearerToken', 'None', 'CustomHeaders'] },
      { providers: ['Webhook'], fits: ['ApiKey', 'None', 'CustomHeaders'] },
    ],
  },
  {
    name: 'Application',
    accepts: ['ApiKey', 'OAuthClientCredentials', 'Basic', 'OAuthAuthorizationCode (where the provider supports it)'],
    rows: [
      { providers: ['Salesforce', 'Zoho', 'QuickBooks', 'Dynamics'], fits: ['OAuthClientCredentials', 'OAuthAuthorizationCode'] },
      { providers: ['HubSpot', 'Stripe', 'Jira'], fits: ['ApiKey', 'OAuthAuthorizationCode'] },
      { providers: ['Slack'], fits: ['OAuthAuthorizationCode'] },
      { providers: ['Braintree', 'Zendesk'], fits: ['ApiKey'] },
      { providers: ['Sap', 'Workday'], fits: ['Basic', 'OAuthClientCredentials'] },
      { providers: ['NetSuite'], fits: ['OAuthClientCredentials'] },
      { providers: ['ServiceNow'], fits: ['Basic'] },
      { providers: ['Shopify'], fits: [], note: 'Uses an access token, which Application does not allow.' },
    ],
  },
  {
    name: 'Messaging',
    accepts: [
      'ConnectionString', 'Basic', 'AwsCredentials', 'AwsRoleAssumption',
      'AzureServicePrincipal', 'AzureManagedIdentity', 'GcpServiceAccount',
    ],
    rows: [
      { providers: ['Kafka', 'RabbitMq'], fits: ['Basic'] },
      { providers: ['AwsSqs', 'AwsSns'], fits: ['AwsCredentials', 'AwsRoleAssumption'] },
      { providers: ['AzureServiceBus'], fits: ['ConnectionString', 'AzureServicePrincipal', 'AzureManagedIdentity'] },
      { providers: ['GooglePubSub'], fits: ['GcpServiceAccount'] },
      { providers: ['RedisStreams'], fits: [], note: 'Only has a password, but Basic also needs a username.' },
    ],
  },
  {
    name: 'AiProvider',
    accepts: ['ApiKey'],
    rows: [
      { providers: ['OpenAi', 'AnthropicClaude', 'Gemini', 'DeepSeek', 'OpenRouter'], fits: ['ApiKey'] },
    ],
  },
  {
    name: 'Custom',
    accepts: ['None', 'ApiKey', 'BearerToken', 'Basic', 'CustomHeaders'],
    rows: [
      { providers: ['Custom'], fits: ['None', 'ApiKey', 'BearerToken', 'Basic', 'CustomHeaders'] },
      { providers: ['Pgp', 'Age'], fits: ['None'] },
    ],
  },
];

export function ProviderCompatibility() {
  return (
    <section className="mt-10 text-sm">
      <h2 className="text-2xl font-semibold tracking-tight">
        Which options go together
      </h2>
      <p className="mt-2 text-fd-muted-foreground">
        The API only checks that the auth mode is on the category&apos;s list. It
        does not check the provider, so a pairing such as S3 with
        AzureManagedIdentity is accepted even though it makes no sense. The
        &quot;Fits&quot; column shows the modes that match each provider&apos;s
        own settings; it is guidance, not enforced.
      </p>
      <div className="mt-5 flex flex-col gap-4">
        {categories.map((c) => (
          <div key={c.name} className="overflow-hidden rounded-xl border">
            <div className="border-b bg-fd-secondary/60 px-4 py-2.5">
              <span className="font-mono font-medium text-fd-primary">
                {c.name}
              </span>
              <p className="mt-0.5 text-xs text-fd-muted-foreground">
                API accepts: <span className="font-mono">{c.accepts.join(', ')}</span>
              </p>
            </div>
            {c.rows.map((r, i) => (
              <div
                key={i}
                className="grid grid-cols-1 gap-x-4 gap-y-1 border-t px-4 py-2.5 first:border-t-0 md:grid-cols-[1fr_1fr]"
              >
                <span className="font-mono">{r.providers.join(', ')}</span>
                <span className="font-mono text-fd-muted-foreground">
                  {r.fits.length > 0 ? (
                    r.fits.join(', ')
                  ) : (
                    <span className="font-sans italic">
                      None fit cleanly. {r.note}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
