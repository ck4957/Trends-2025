export const getCategoryColor = (slug: string) => {
  const colors: { [key: string]: string } = {
    technology: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    entertainment:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    sports: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    politics: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    science:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    health: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    "business-finance":
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    "food-drink":
      "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    "travel-transportation":
      "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
    "law-government":
      "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200",
    "autos-vehicles":
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    "beauty-fashion":
      "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-200",
    climate:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    games:
      "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200",
    "hobbies-leisure":
      "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200",
    "jobs-education":
      "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
    "pets-animals":
      "bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200",
    shopping: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
    other: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  };

  return colors[slug] || colors["other"];
};
