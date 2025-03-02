import { useEffect, useState } from "react";
import { copy, copy2, linkIcon, tick, loader } from "../assets";
import { useLazyGetSummaryQuery } from "../services/article";

const Demo = () => {
  const [article, setArticle] = useState({
    url: "",
    summary: "",
  });

  const [allArticles, setAllArticles] = useState([]);
  const [copied, setCopied] = useState(false);
  const [getSummary, { error, isFetching }] = useLazyGetSummaryQuery();

  const googleTranslateApiKey = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;

  useEffect(() => {
    const articlesFromLocalStorage = JSON.parse(localStorage.getItem("articles"));
    if (articlesFromLocalStorage) {
      setAllArticles(articlesFromLocalStorage);
    }
  }, []);

  const handleCopy = (copyUrl) => {
    setCopied(copyUrl);
    navigator.clipboard.writeText(copyUrl);
    setTimeout(() => setCopied(false), 3000);
  };

  const translateText = async (text) => {
    try {
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${googleTranslateApiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            q: text,
            target: "tr",
          }),
        }
      );
      const data = await response.json();
      return data.data.translations[0].translatedText;
    } catch (error) {
      console.error("Translation error:", error);
      return text;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data } = await getSummary({ articleUrl: article.url });
    if (data?.summary) {
      const translatedText = await translateText(data.summary);
      const newArticle = { ...article, summary: translatedText };
      const updatedArticles = [newArticle, ...allArticles];

      setArticle(newArticle);
      setAllArticles(updatedArticles);
      console.log(updatedArticles);

      localStorage.setItem("articles", JSON.stringify(updatedArticles));
    }
  };

  return (
    <section className="mt-16 w-full max-w-xl">
      {/* Search */}
      <div className="flex flex-col w-full gap-2">
        <form className="relative flex justify-center items-center" onSubmit={handleSubmit}>
          <img src={linkIcon} alt="link_icon" className="absolute left-0 my-2 ml-3 w-5" />
          <input
            type="url"
            placeholder="https://example.com"
            value={article.url}
            onChange={(e) => setArticle({ ...article, url: e.target.value })}
            required
            className="url_input peer"
          />
          <button type="submit" className="submit_btn peer-focus:border-gray-700 peer-focus:text-gray-700">
            <img src={copy} alt="copy_icon" className="w-5" />
          </button>
        </form>
        {/* Browse URL */}
        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
          {allArticles.reverse().map((item, index) => (
            <div key={`link-${index}`} onClick={() => setArticle(item)} className="link_card">
              <div className="copy_btn" onClick={() => handleCopy(item.url)}>
                <img
                  src={copied === item.url ? tick : copy2}
                  alt={copied === item.url ? "tick_icon" : "copy_icon"}
                  className="w-[40%] h-[40%] object-contain"
                />
              </div>
              <p className="flex-1 font-satoshi text-blue-700 font-medium text-sm truncate">{item.url}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Display Result */}
      <div className="my-10 max-w-full flex justify-center items-center">
        {isFetching ? (
          <img src={loader} alt="loader" className="w-20 h-20 object-contain" />
        ) : error ? (
          <p className="font-inter font-bold text-black text-center">
            Bunun olmaması gerekiyordu... Lütfen makalenizi kontrol edin ve tekrar deneyin.
            <br />
            <span className="font-satoshi font-normal text-gray-700">{error?.data?.error}</span>
          </p>
        ) : (
          article.summary && (
            <div className="flex flex-col gap-3">
              <h2 className="font-satoshi font-bold text-gray-600 text-xl">
                Makalenin <span className="blue_gradient">Özeti</span>
              </h2>
              <div className="summary_box">
                <p className="font-inter font-medium text-sm text-gray-700">{article.summary}</p>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
};

export default Demo;
