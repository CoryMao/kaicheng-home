import { ArticleEditor } from "@/components/article-editor";
import { createArticle } from "@/lib/admin-actions";

export default function NewArticlePage() {
  return <ArticleEditor mode="new" saveAction={createArticle} />;
}
