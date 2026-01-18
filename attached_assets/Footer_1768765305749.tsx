import React from 'react';
import { Twitter, Instagram, Linkedin, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#F6F8F8] pt-16 pb-8 border-t border-[#E6F2F0]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-[#1EA7A1] to-[#0B6A66] flex items-center justify-center text-white font-bold text-lg">T</div>
            <div className="font-bold text-xl text-[#0B1F21]">TERA</div>
          </div>
          <p className="text-[#6B7474] text-sm leading-relaxed max-w-xs">
            El sistema operativo para tus archivos en la nube. Simple, seguro e inteligente.
          </p>
          <div className="flex gap-4 pt-2">
            <a href="#" className="text-[#6B7474] hover:text-[#1C3F3A] transition-colors"><Twitter size={20} /></a>
            <a href="#" className="text-[#6B7474] hover:text-[#1C3F3A] transition-colors"><Instagram size={20} /></a>
            <a href="#" className="text-[#6B7474] hover:text-[#1C3F3A] transition-colors"><Linkedin size={20} /></a>
          </div>
        </div>
        
        <div>
          <div className="font-bold text-[#1C3F3A] mb-4">Soluciones</div>
          <ul className="text-sm text-[#6B7474] space-y-3">
            <li><a href="#" className="hover:text-[#1EA7A1] transition-colors">Pequeñas Empresas</a></li>
            <li><a href="#" className="hover:text-[#1EA7A1] transition-colors">Freelancers</a></li>
            <li><a href="#" className="hover:text-[#1EA7A1] transition-colors">Estudiantes</a></li>
            <li><a href="#" className="hover:text-[#1EA7A1] transition-colors">Enterprise</a></li>
          </ul>
        </div>
        
        <div>
          <div className="font-bold text-[#1C3F3A] mb-4">Compañía</div>
          <ul className="text-sm text-[#6B7474] space-y-3">
            <li><a href="#" className="hover:text-[#1EA7A1] transition-colors">Sobre Nosotros</a></li>
            <li><a href="#" className="hover:text-[#1EA7A1] transition-colors">Carreras</a></li>
            <li><a href="#" className="hover:text-[#1EA7A1] transition-colors">Blog</a></li>
            <li><a href="#" className="hover:text-[#1EA7A1] transition-colors">Contacto</a></li>
          </ul>
        </div>
        
        <div>
          <div className="font-bold text-[#1C3F3A] mb-4">Aprende</div>
          <ul className="text-sm text-[#6B7474] space-y-3">
            <li><a href="#" className="hover:text-[#1EA7A1] transition-colors">Centro de Ayuda</a></li>
            <li><a href="#" className="hover:text-[#1EA7A1] transition-colors">Guías de Inicio</a></li>
            <li><a href="#" className="hover:text-[#1EA7A1] transition-colors">API Docs</a></li>
            <li><a href="#" className="hover:text-[#1EA7A1] transition-colors">Comunidad</a></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 pt-8 border-t border-[#E6F2F0] flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#9BA3A3]">
        <div>© TERA 2025. Todos los derechos reservados.</div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-[#6B7474]">Privacidad</a>
          <a href="#" className="hover:text-[#6B7474]">Términos</a>
          <a href="#" className="hover:text-[#6B7474]">Cookies</a>
        </div>
      </div>
    </footer>
  );
}
