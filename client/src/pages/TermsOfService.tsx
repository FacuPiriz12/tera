import { Link } from "wouter";
import { ArrowLeft, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function TermsOfService() {
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

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1>{t('landing.terms.title')}</h1>
          <p className="text-muted-foreground">
            {t('landing.terms.lastUpdated')}: {new Date().toLocaleDateString(dateLocale, { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <h2>{t('landing.terms.section1.title')}</h2>
          <p>{t('landing.terms.section1.content')}</p>

          <h2>{t('landing.terms.section2.title')}</h2>
          <p>{t('landing.terms.section2.content')}</p>

          <h2>{t('landing.terms.section3.title')}</h2>
          <p>{t('landing.terms.section3.intro')}</p>
          <ul>
            <li>{t('landing.terms.section3.item1')}</li>
            <li>{t('landing.terms.section3.item2')}</li>
            <li>{t('landing.terms.section3.item3')}</li>
            <li>{t('landing.terms.section3.item4')}</li>
          </ul>

          <h2>{t('landing.terms.section4.title')}</h2>
          <p>{t('landing.terms.section4.intro')}</p>
          <ul>
            <li>{t('landing.terms.section4.item1')}</li>
            <li>{t('landing.terms.section4.item2')}</li>
            <li>{t('landing.terms.section4.item3')}</li>
            <li>{t('landing.terms.section4.item4')}</li>
            <li>{t('landing.terms.section4.item5')}</li>
            <li>{t('landing.terms.section4.item6')}</li>
          </ul>

          <h2>{t('landing.terms.section5.title')}</h2>
          <p>{t('landing.terms.section5.intro')}</p>
          <ul>
            <li>{t('landing.terms.section5.item1')}</li>
            <li>{t('landing.terms.section5.item2')}</li>
            <li>{t('landing.terms.section5.item3')}</li>
          </ul>
          <p>{t('landing.terms.section5.note')}</p>

          <h2>{t('landing.terms.section6.title')}</h2>
          <p>{t('landing.terms.section6.intro')}</p>
          <ul>
            <li>{t('landing.terms.section6.item1')}</li>
            <li>{t('landing.terms.section6.item2')}</li>
            <li>{t('landing.terms.section6.item3')}</li>
            <li>{t('landing.terms.section6.item4')}</li>
          </ul>
          <p>{t('landing.terms.section6.note')}</p>

          <h2>{t('landing.terms.section7.title')}</h2>
          <p>{t('landing.terms.section7.content')}</p>

          <h2>{t('landing.terms.section8.title')}</h2>
          <p>{t('landing.terms.section8.content')}</p>

          <h2>{t('landing.terms.section9.title')}</h2>
          <p>{t('landing.terms.section9.intro')}</p>
          <ul>
            <li>{t('landing.terms.section9.item1')}</li>
            <li>{t('landing.terms.section9.item2')}</li>
            <li>{t('landing.terms.section9.item3')}</li>
            <li>{t('landing.terms.section9.item4')}</li>
            <li>{t('landing.terms.section9.item5')}</li>
          </ul>
          <p>{t('landing.terms.section9.note')}</p>

          <h2>{t('landing.terms.section10.title')}</h2>
          <p>{t('landing.terms.section10.content')}</p>

          <h2>{t('landing.terms.section11.title')}</h2>
          <p>{t('landing.terms.section11.content')}</p>

          <h2>{t('landing.terms.section12.title')}</h2>
          <p>{t('landing.terms.section12.content')}</p>

          <h2>{t('landing.terms.section13.title')}</h2>
          <p>{t('landing.terms.section13.content')}</p>

          <h2>{t('landing.terms.section14.title')}</h2>
          <p>{t('landing.terms.section14.content')}</p>
          <p>
            <strong>Email:</strong> {t('landing.terms.section14.email')}
          </p>
        </div>
      </div>
    </div>
  );
}
