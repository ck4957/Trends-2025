import Layout from "../components/Layout";

export default function Terms() {
  return (
    <Layout
      title="Terms of Service - ClickSpill"
      description="Read the terms and conditions for using ClickSpill."
    >
      <section className="max-w-2xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          Terms of Service
        </h1>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          By using ClickSpill, you agree to our terms and conditions. Please
          read them carefully before using our website.
        </p>
        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
          <li>Use ClickSpill for lawful purposes only.</li>
          <li>Do not misuse or attempt to disrupt our services.</li>
          <li>
            Content is provided for informational purposes and may change
            without notice.
          </li>
          <li>We are not responsible for third-party content or links.</li>
        </ul>
      </section>
    </Layout>
  );
}
