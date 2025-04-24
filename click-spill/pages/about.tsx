import Layout from "../components/Layout";

export default function About() {
  return (
    <Layout title="About Us - ClickSpill" description="Learn more about ClickSpill, our mission, and our team.">
      <section className="max-w-2xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">About Us</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          ClickSpill is your daily source for trending topics and viral news, powered by AI. Our mission is to keep you informed and inspired by surfacing the most relevant stories and insights from around the world.
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          We believe in transparency, accuracy, and delivering value to our readers. Thank you for being part of our community!
        </p>
        <p className="text-gray-700 dark:text-gray-300 mt-4">
          All trending topics and news are sourced from {""}
          <a
            href="https://trends.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-blue-600"
          >
            Google Trends
          </a>.
        </p>
      </section>
    </Layout>
  );
}