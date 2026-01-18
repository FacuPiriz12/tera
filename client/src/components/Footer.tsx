import React from 'react';
import { Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white pt-20 pb-10 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-20 text-center">
        <div className="flex flex-col items-center space-y-8">
          <div className="font-black text-4xl text-gray-900 tracking-tighter">TERA</div>
          <p className="text-gray-500 font-bold max-w-md mx-auto leading-relaxed">
            El sistema operativo para tus archivos en la nube. Simple, seguro e inteligente.
          </p>
          <div className="flex gap-8 justify-center">
            <a href="#" className="text-gray-400 hover:text-blue-600 transition-all hover:scale-110">
              <Twitter size={24} />
            </a>
            <a href="#" className="text-gray-400 hover:text-blue-600 transition-all hover:scale-110">
              <Instagram size={24} />
            </a>
            <a href="#" className="text-gray-400 hover:text-blue-600 transition-all hover:scale-110">
              <Linkedin size={24} />
            </a>
          </div>
          <div className="h-px w-20 bg-gray-100"></div>
          <p className="text-gray-400 font-black tracking-widest uppercase text-xs">
            © 2026 TERA. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}