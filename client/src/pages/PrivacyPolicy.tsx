import { Link } from "wouter";
import { ArrowLeft, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function PrivacyPolicy() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  
  const dateLocale = currentLang === 'es' ? 'es-ES' : 'en-US';

  const toggleLanguage = () => {
    const newLang = currentLang === 'es' ? 'en' : 'es';
    i18n.changeLanguage(newLang);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Link href="/">
            <Button variant="ghost" data-testid="button-back">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('landing.footer.back')}
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={toggleLanguage}
            data-testid="button-language-toggle"
          >
            <Globe className="mr-2 h-4 w-4" />
            {currentLang === 'es' ? 'English' : 'Español'}
          </Button>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-black prose-h1:text-4xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-gray-900">
          <h1 className="mb-4">{t('landing.privacy.title')}</h1>
          <p className="text-muted-foreground mb-12">
            {t('landing.privacy.lastUpdated')}: {new Date().toLocaleDateString(dateLocale, { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-12">
            <h2 className="border-b pb-2 mb-4">{t('landing.privacy.section1.title')}</h2>
            <p className="leading-relaxed">{t('landing.privacy.section1.content')}</p>
          </section>

          <section className="mb-12">
            <h2 className="border-b pb-2 mb-4">{t('landing.privacy.section2.title')}</h2>
            
            <div className="mb-6">
              <h3 className="mb-3 text-blue-600">{t('landing.privacy.section2.subsection1.title')}</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>{t('landing.privacy.section2.subsection1.item1')}</strong></li>
                <li><strong>{t('landing.privacy.section2.subsection1.item2')}</strong></li>
                <li><strong>{t('landing.privacy.section2.subsection1.item3')}</strong></li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="mb-3 text-blue-600">{t('landing.privacy.section2.subsection2.title')}</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>{t('landing.privacy.section2.subsection2.item1')}</strong></li>
                <li><strong>{t('landing.privacy.section2.subsection2.item2')}</strong></li>
                <li><strong>{t('landing.privacy.section2.subsection2.item3')}</strong></li>
                <li><strong>{t('landing.privacy.section2.subsection2.item4')}</strong></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-blue-600">{t('landing.privacy.section2.subsection3.title')}</h3>
              <p className="mb-4">{t('landing.privacy.section2.subsection3.intro')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('landing.privacy.section2.subsection3.item1')}</li>
                <li>{t('landing.privacy.section2.subsection3.item2')}</li>
                <li>{t('landing.privacy.section2.subsection3.item3')}</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="border-b pb-2 mb-4">{t('landing.privacy.section3.title')}</h2>
            <p className="mb-4">{t('landing.privacy.section3.intro')}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>{t('landing.privacy.section3.item1')}</strong></li>
              <li><strong>{t('landing.privacy.section3.item2')}</strong></li>
              <li><strong>{t('landing.privacy.section3.item3')}</strong></li>
              <li><strong>{t('landing.privacy.section3.item4')}</strong></li>
              <li><strong>{t('landing.privacy.section3.item5')}</strong></li>
              <li><strong>{t('landing.privacy.section3.item6')}</strong></li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="border-b pb-2 mb-4">{t('landing.privacy.section4.title')}</h2>
            
            <div className="mb-6">
              <h3 className="mb-3 text-blue-600">{t('landing.privacy.section4.subsection1.title')}</h3>
              <p className="mb-4">{t('landing.privacy.section4.subsection1.intro')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><code className="bg-gray-100 px-2 py-0.5 rounded">{t('landing.privacy.section4.subsection1.item1')}</code></li>
                <li><code className="bg-gray-100 px-2 py-0.5 rounded">{t('landing.privacy.section4.subsection1.item2')}</code></li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="mb-3 text-blue-600">{t('landing.privacy.section4.subsection2.title')}</h3>
              <p className="mb-4">{t('landing.privacy.section4.subsection2.intro')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('landing.privacy.section4.subsection2.item1')}</li>
                <li>{t('landing.privacy.section4.subsection2.item2')}</li>
                <li>{t('landing.privacy.section4.subsection2.item3')}</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-blue-600">{t('landing.privacy.section4.subsection3.title')}</h3>
              <p className="mb-4">{t('landing.privacy.section4.subsection3.content')}</p>
              <p className="mb-4"><strong>{t('landing.privacy.section4.subsection3.intro')}</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('landing.privacy.section4.subsection3.item1')}</li>
                <li>{t('landing.privacy.section4.subsection3.item2')}</li>
                <li>{t('landing.privacy.section4.subsection3.item3')}</li>
                <li>{t('landing.privacy.section4.subsection3.item4')}</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="border-b pb-2 mb-4">{t('landing.privacy.section5.title')}</h2>
            
            <div className="mb-6">
              <h3 className="mb-3 text-blue-600">{t('landing.privacy.section5.subsection1.title')}</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>{t('landing.privacy.section5.subsection1.item1')}</strong></li>
                <li><strong>{t('landing.privacy.section5.subsection1.item2')}</strong></li>
                <li><strong>{t('landing.privacy.section5.subsection1.item3')}</strong></li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="mb-3 text-blue-600">{t('landing.privacy.section5.subsection2.title')}</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('landing.privacy.section5.subsection2.item1')}</li>
                <li>{t('landing.privacy.section5.subsection2.item2')}</li>
                <li>{t('landing.privacy.section5.subsection2.item3')}</li>
                <li>{t('landing.privacy.section5.subsection2.item4')}</li>
                <li>{t('landing.privacy.section5.subsection2.item5')}</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-blue-600">{t('landing.privacy.section5.subsection3.title')}</h3>
              <p>{t('landing.privacy.section5.subsection3.content')}</p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="border-b pb-2 mb-4">{t('landing.privacy.section6.title')}</h2>
            <p className="mb-6">{t('landing.privacy.section6.intro')}</p>
            
            <div className="mb-6">
              <h3 className="mb-3 text-blue-600">{t('landing.privacy.section6.subsection1.title')}</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>{t('landing.privacy.section6.subsection1.item1')}</strong></li>
                <li><strong>{t('landing.privacy.section6.subsection1.item2')}</strong></li>
                <li><strong>{t('landing.privacy.section6.subsection1.item3')}</strong></li>
                <li><strong>{t('landing.privacy.section6.subsection1.item4')}</strong></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-blue-600">{t('landing.privacy.section6.subsection2.title')}</h3>
              <p>{t('landing.privacy.section6.subsection2.content')}</p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="border-b pb-2 mb-4">{t('landing.privacy.section7.title')}</h2>
            <p className="mb-4">{t('landing.privacy.section7.intro')}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>{t('landing.privacy.section7.item1')}</strong></li>
              <li><strong>{t('landing.privacy.section7.item2')}</strong></li>
              <li><strong>{t('landing.privacy.section7.item3')}</strong></li>
              <li><strong>{t('landing.privacy.section7.item4')}</strong></li>
              <li><strong>{t('landing.privacy.section7.item5')}</strong></li>
              <li><strong>{t('landing.privacy.section7.item6')}</strong></li>
            </ul>
            <p className="mt-4">{t('landing.privacy.section7.contact')}</p>
          </section>

          <section className="mb-12">
            <h2 className="border-b pb-2 mb-4">{t('landing.privacy.section8.title')}</h2>
            <p className="mb-4">{t('landing.privacy.section8.intro')}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('landing.privacy.section8.item1')}</li>
              <li>{t('landing.privacy.section8.item2')}</li>
              <li>{t('landing.privacy.section8.item3')}</li>
            </ul>
            <p className="mt-4 italic">{t('landing.privacy.section8.note')}</p>
          </section>

          <section className="mb-12">
            <h2 className="border-b pb-2 mb-4">{t('landing.privacy.section9.title')}</h2>
            <p>{t('landing.privacy.section9.content')}</p>
          </section>

          <section className="mb-12">
            <h2 className="border-b pb-2 mb-4">{t('landing.privacy.section10.title')}</h2>
            <p>{t('landing.privacy.section10.content')}</p>
          </section>

          <section className="mb-12">
            <h2 className="border-b pb-2 mb-4">{t('landing.privacy.section11.title')}</h2>
            <p>{t('landing.privacy.section11.content')}</p>
          </section>

          <section className="mb-12">
            <h2 className="border-b pb-2 mb-4">{t('landing.privacy.section12.title')}</h2>
            <p className="mb-4">{t('landing.privacy.section12.content')}</p>
            <p className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <strong className="text-blue-900">Email:</strong> <span className="text-blue-600">{t('landing.privacy.section12.email')}</span>
            </p>
          </section>

          <section className="mb-12">
            <h2 className="border-b pb-2 mb-4">{t('landing.privacy.section13.title')}</h2>
            <p className="mb-4">{t('landing.privacy.section13.intro')}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('landing.privacy.section13.item1')}</li>
              <li>{t('landing.privacy.section13.item2')}</li>
              <li>{t('landing.privacy.section13.item3')}</li>
              <li>{t('landing.privacy.section13.item4')}</li>
            </ul>
          </section>
        </div>
        </div>
      </div>
    </div>
  );
}
