import { TravelUpdate } from '@/types';
import Image from 'next/image';
import { memo } from 'react';

interface UpdateCardProps {
  update: TravelUpdate;
  onClick?: () => void;
}

const UpdateCard = memo(function UpdateCard({ update, onClick }: UpdateCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const isTestPhoto = (photoUrl: string) => {
    return photoUrl.startsWith('test-photo-');
  };

  return (
    <article 
      onClick={onClick}
      className="group bg-black overflow-hidden transition-all duration-700 hover:shadow-[0_0_60px_rgba(0,188,212,0.15)] relative border-l-4 border-transparent hover:border-[#00BCD4] cursor-pointer"
    >
      {/* Photos */}
      {update.photos && update.photos.length > 0 && (
        <div className="relative h-[600px] w-full overflow-hidden">
          {isTestPhoto(update.photos[0]) ? (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
              <div className="text-center">
                <svg className="w-24 h-24 mx-auto text-white/10 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-white/20 text-xs font-sans uppercase tracking-[0.4em]">Test Image</p>
              </div>
            </div>
          ) : (
            <Image
              src={update.photos[0]}
              alt={update.title}
              fill
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              className="object-cover transition-all duration-1000 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
              loading="lazy"
            />
          )}

          {/* Overlay minimaliste */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-700"></div>

          {/* Jour - minimaliste */}
          <div className="absolute top-12 left-12 z-10">
            <span className="text-8xl font-display font-black text-white/10 group-hover:text-[#00BCD4] leading-none tracking-tighter transition-colors duration-500">
              {update.day.toString().padStart(2, '0')}
            </span>
          </div>

          {/* Badge test si nécessaire */}
          {update.photos && update.photos.length > 0 && isTestPhoto(update.photos[0]) && (
            <div className="absolute top-12 right-12 z-10 bg-[#00BCD4] px-3 py-1">
              <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-black font-bold">TEST</span>
            </div>
          )}

          {/* Info en bas - ultra épuré */}
          <div className="absolute bottom-12 left-12 right-12 z-10">
            <div className="mb-4">
              <span className="text-[10px] font-sans uppercase tracking-[0.5em] text-[#00BCD4] font-medium">
                {formatDate(update.date)}
              </span>
            </div>
            <h3 className="text-4xl md:text-5xl font-display font-black text-white leading-[0.95] mb-4 tracking-tighter">
              {update.title}
            </h3>
            <div className="flex items-center gap-2 text-white/60">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-sans tracking-wide">{update.location.name}</span>
            </div>
          </div>
        </div>
      )}

      {/* Extrait - minimaliste */}
      <div className="px-12 py-16 bg-black">
        <p className="text-white/50 font-sans leading-loose text-sm mb-8 line-clamp-3">
          {update.description}
        </p>

        <div className="flex items-center justify-between">
          <button 
            onClick={onClick}
            className="flex items-center gap-2 text-[#00BCD4] font-sans text-[10px] uppercase tracking-[0.4em] group-hover:gap-3 transition-all duration-300 hover:text-white"
          >
            <span>Lire</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
          {update.photos && update.photos.length > 1 && (
            <span className="text-[10px] text-white/20 font-sans tracking-wider">{update.photos.length} photos</span>
          )}
        </div>
      </div>
    </article>
  );
});

export default UpdateCard;
