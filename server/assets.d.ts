declare module "fishn:assets" {
  const assets: Record<string, { body: string; type: string; etag: string }>;
  export default assets;
}
