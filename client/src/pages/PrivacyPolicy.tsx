import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function PrivacyPolicy() {
  const { t, i18n } = useTranslation('pages');
  const currentLang = i18n.language;
  
  const dateLocale = currentLang === 'es' ? 'es-ES' : 'en-US';
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('privacy.back')}
          </Button>
        </Link>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1>{t('privacy.title')}</h1>
          <p className="text-muted-foreground">
            {t('privacy.lastUpdated')}: {new Date().toLocaleDateString(dateLocale, { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <h2>{t('privacy.section1.title')}</h2>
          <p>{t('privacy.section1.content')}</p>

          <h2>{t('privacy.section2.title')}</h2>
          
          <h3>{t('privacy.section2.subsection1.title')}</h3>
          <ul>
            <li><strong>{t('privacy.section2.subsection1.item1')}</strong></li>
            <li><strong>{t('privacy.section2.subsection1.item2')}</strong></li>
            <li><strong>{t('privacy.section2.subsection1.item3')}</strong></li>
          </ul>

          <h3>{t('privacy.section2.subsection2.title')}</h3>
          <ul>
            <li><strong>{t('privacy.section2.subsection2.item1')}</strong></li>
            <li><strong>{t('privacy.section2.subsection2.item2')}</strong></li>
            <li><strong>{t('privacy.section2.subsection2.item3')}</strong></li>
            <li><strong>{t('privacy.section2.subsection2.item4')}</strong></li>
          </ul>

          <h3>{t('privacy.section2.subsection3.title')}</h3>
          <p>{t('privacy.section2.subsection3.intro')}</p>
          <ul>
            <li>{t('privacy.section2.subsection3.item1')}</li>
            <li>{t('privacy.section2.subsection3.item2')}</li>
            <li>{t('privacy.section2.subsection3.item3')}</li>
          </ul>

          <h2>{t('privacy.section3.title')}</h2>
          <p>{t('privacy.section3.intro')}</p>
          <ul>
            <li><strong>{t('privacy.section3.item1')}</strong></li>
            <li><strong>{t('privacy.section3.item2')}</strong></li>
            <li><strong>{t('privacy.section3.item3')}</strong></li>
            <li><strong>{t('privacy.section3.item4')}</strong></li>
            <li><strong>{t('privacy.section3.item5')}</strong></li>
            <li><strong>{t('privacy.section3.item6')}</strong></li>
          </ul>

          <h2>{t('privacy.section4.title')}</h2>
          
          <h3>{t('privacy.section4.subsection1.title')}</h3>
          <p>{t('privacy.section4.subsection1.intro')}</p>
          <ul>
            <li><code>{t('privacy.section4.subsection1.item1')}</code></li>
            <li><code>{t('privacy.section4.subsection1.item2')}</code></li>
          </ul>

          <h3>{t('privacy.section4.subsection2.title')}</h3>
          <p>{t('privacy.section4.subsection2.intro')}</p>
          <ul>
            <li>{t('privacy.section4.subsection2.item1')}</li>
            <li>{t('privacy.section4.subsection2.item2')}</li>
            <li>{t('privacy.section4.subsection2.item3')}</li>
          </ul>

          <h3>{t('privacy.section4.subsection3.title')}</h3>
          <p>{t('privacy.section4.subsection3.content')}</p>
          <p><strong>{t('privacy.section4.subsection3.intro')}</strong></p>
          <ul>
            <li>{t('privacy.section4.subsection3.item1')}</li>
            <li>{t('privacy.section4.subsection3.item2')}</li>
            <li>{t('privacy.section4.subsection3.item3')}</li>
            <li>{t('privacy.section4.subsection3.item4')}</li>
          </ul>

          <h2>{t('privacy.section5.title')}</h2>
          
          <h3>{t('privacy.section5.subsection1.title')}</h3>
          <ul>
            <li><strong>{t('privacy.section5.subsection1.item1')}</strong></li>
            <li><strong>{t('privacy.section5.subsection1.item2')}</strong></li>
            <li><strong>{t('privacy.section5.subsection1.item3')}</strong></li>
          </ul>

          <h3>{t('privacy.section5.subsection2.title')}</h3>
          <ul>
            <li>{t('privacy.section5.subsection2.item1')}</li>
            <li>{t('privacy.section5.subsection2.item2')}</li>
            <li>{t('privacy.section5.subsection2.item3')}</li>
            <li>{t('privacy.section5.subsection2.item4')}</li>
            <li>{t('privacy.section5.subsection2.item5')}</li>
          </ul>

          <h3>{t('privacy.section5.subsection3.title')}</h3>
          <p>{t('privacy.section5.subsection3.content')}</p>

          <h2>{t('privacy.section6.title')}</h2>
          <p>{t('privacy.section6.intro')}</p>
          
          <h3>{t('privacy.section6.subsection1.title')}</h3>
          <ul>
            <li><strong>{t('privacy.section6.subsection1.item1')}</strong></li>
            <li><strong>{t('privacy.section6.subsection1.item2')}</strong></li>
            <li><strong>{t('privacy.section6.subsection1.item3')}</strong></li>
            <li><strong>{t('privacy.section6.subsection1.item4')}</strong></li>
          </ul>

          <h3>{t('privacy.section6.subsection2.title')}</h3>
          <p>{t('privacy.section6.subsection2.content')}</p>

          <h2>{t('privacy.section7.title')}</h2>
          <p>{t('privacy.section7.intro')}</p>
          <ul>
            <li><strong>{t('privacy.section7.item1')}</strong></li>
            <li><strong>{t('privacy.section7.item2')}</strong></li>
            <li><strong>{t('privacy.section7.item3')}</strong></li>
            <li><strong>{t('privacy.section7.item4')}</strong></li>
            <li><strong>{t('privacy.section7.item5')}</strong></li>
            <li><strong>{t('privacy.section7.item6')}</strong></li>
          </ul>
          <p>{t('privacy.section7.contact')}</p>

          <h2>{t('privacy.section8.title')}</h2>
          <p>{t('privacy.section8.intro')}</p>
          <ul>
            <li>{t('privacy.section8.item1')}</li>
            <li>{t('privacy.section8.item2')}</li>
            <li>{t('privacy.section8.item3')}</li>
          </ul>
          <p>{t('privacy.section8.note')}</p>

          <h2>{t('privacy.section9.title')}</h2>
          <p>{t('privacy.section9.content')}</p>

          <h2>{t('privacy.section10.title')}</h2>
          <p>{t('privacy.section10.content')}</p>

          <h2>{t('privacy.section11.title')}</h2>
          <p>{t('privacy.section11.content')}</p>

          <h2>{t('privacy.section12.title')}</h2>
          <p>{t('privacy.section12.content')}</p>
          <p>
            <strong>Email:</strong> {t('privacy.section12.email')}
          </p>

          <h2>{t('privacy.section13.title')}</h2>
          <p>{t('privacy.section13.intro')}</p>
          <ul>
            <li>{t('privacy.section13.item1')}</li>
            <li>{t('privacy.section13.item2')}</li>
            <li>{t('privacy.section13.item3')}</li>
            <li>{t('privacy.section13.item4')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
