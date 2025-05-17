import { GetServerSideProps } from "next";
import Head from "next/head";

export default function DebugMeta({ url }: { url: string }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Meta Tag Debugger</h1>
      <p className="mb-4">
        View the page source (or inspect element) to see all meta tags for this
        URL.
      </p>
      <p className="mb-2">
        URL being debugged: <strong>{url}</strong>
      </p>
      <p className="text-sm text-gray-500">
        This page is rendered server-side to match what crawlers will see.
      </p>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Get current URL for display
  const protocol = context.req.headers["x-forwarded-proto"] || "http";
  const host = context.req.headers.host;
  const url = `${protocol}://${host}${context.req.url}`;

  return {
    props: {
      url,
    },
  };
};
