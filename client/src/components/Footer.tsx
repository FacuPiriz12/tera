import CloneDriveLogo from "./CloneDriveLogo";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-border bg-muted/30" data-testid="footer-main">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-6 text-sm">
            <Link href="/terms">
              <a className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-terms">
                Términos de Servicio
              </a>
            </Link>
            <Link href="/privacy">
              <a className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-privacy">
                Política de Privacidad
              </a>
            </Link>
          </div>
          <p className="text-muted-foreground text-sm text-center">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}