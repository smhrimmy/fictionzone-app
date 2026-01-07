export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  const query = url.searchParams.get('query');

  if (action === 'search') {
    // In a real implementation, this would fetch from fictionzone.net or other sources
    // For now, we return mock results to simulate the API
    return new Response(
      JSON.stringify({
        results: [
          { title: `Result for ${query}`, url: 'https://fictionzone.net/novel/example' }
        ]
      }),
      {
        status: 200,
        headers: {
          'content-type': 'application/json',
          'cache-control': 'public, s-maxage=1200, stale-while-revalidate=600',
        },
      }
    );
  }

  return new Response(
    JSON.stringify({
      message: 'Novel API is running. Use ?action=search&query=... to fetch data.'
    }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    }
  );
}
