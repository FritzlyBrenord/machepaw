import { redirect } from "next/navigation";

type CollectionCategoryPageProps = {
  params: {
    category: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
};

function buildCollectionQuery(
  category: string,
  searchParams?: CollectionCategoryPageProps["searchParams"],
) {
  const query = new URLSearchParams();
  query.set("category", category);

  Object.entries(searchParams || {}).forEach(([key, value]) => {
    if (key === "category") {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (typeof entry === "string" && entry.trim()) {
          query.append(key, entry);
        }
      });
      return;
    }

    if (typeof value === "string" && value.trim()) {
      query.set(key, value);
    }
  });

  const queryString = query.toString();
  return queryString ? `/collection?${queryString}` : "/collection";
}

export default function CollectionCategoryPage({
  params,
  searchParams,
}: CollectionCategoryPageProps) {
  const category = params.category?.trim();

  if (!category) {
    redirect("/collection");
  }

  redirect(buildCollectionQuery(category, searchParams));
}
