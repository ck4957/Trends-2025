import React from 'react';
import Layout from '../components/Layout';

const Home: React.FC = () => {
    return (
        <Layout>
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <h1 className="text-4xl font-bold text-center text-blue-600">Welcome to Buzzify AI</h1>
                <p className="mt-4 text-lg text-center text-gray-700">
                    Your go-to source for AI-generated content based on the latest trends.
                </p>
                <div className="mt-8">
                    <h2 className="text-2xl font-semibold">Trending Topics</h2>
                    <ul className="mt-4 space-y-2">
                        <li className="p-4 bg-white rounded shadow">Topic 1</li>
                        <li className="p-4 bg-white rounded shadow">Topic 2</li>
                        <li className="p-4 bg-white rounded shadow">Topic 3</li>
                    </ul>
                </div>
            </div>
        </Layout>
    );
};

export default Home;