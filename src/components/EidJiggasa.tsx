import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, HelpCircle, ChevronDown, Sparkles } from 'lucide-react';

interface EidJiggasaProps {
  isOpen: boolean;
  onClose: () => void;
}

const QA_LIST = [
  {
    id: 1,
    question: 'ঈদের নামাজের নিয়ম কি?',
    answer: 'ঈদের নামাজ ২ রাকাত। প্রথম রাকাতে ছানার পর ৩টি অতিরিক্ত তাকবির দিতে হয়। দ্বিতীয় রাকাতে রুকুর আগে ৩টি অতিরিক্ত তাকবির দিতে হয়।'
  },
  {
    id: 2,
    question: 'ঈদের দিনের সুন্নত কাজগুলো কি কি?',
    answer: '১. গোসল করা\n২. পরিষ্কার বা নতুন কাপড় পরা\n৩. সুগন্ধি ব্যবহার করা\n৪. ঈদগাহে যাওয়ার আগে মিষ্টিমুখ করা (ঈদুল ফিতরে)\n৫. এক রাস্তায় গিয়ে অন্য রাস্তায় ফেরা।'
  },
  {
    id: 3,
    question: 'ফিতরা কেন দিতে হয় এবং কার ওপর ওয়াজিব?',
    answer: 'রোজার ভুলত্রুটি সংশোধনের জন্য ফিতরা দেওয়া হয়। ঈদের দিন সকালে যার কাছে নিসাব পরিমাণ সম্পদ থাকে, তার ওপর ফিতরা ওয়াজিব।'
  },
  {
    id: 4,
    question: 'কোরবানির পশুর বয়স কত হতে হয়?',
    answer: 'উট ৫ বছর, গরু বা মহিষ ২ বছর, এবং ছাগল, ভেড়া বা দুম্বা ১ বছর হতে হবে। (তবে ৬ মাসের দুম্বা যদি দেখতে ১ বছরের মতো বড় হয়, তবে তা দিয়েও কোরবানি জায়েজ)।'
  },
  {
    id: 5,
    question: 'ঈদের শুভেচ্ছা জানানোর কিছু সুন্দর মেসেজ দিন।',
    answer: '১. "ঈদ মোবারক! আল্লাহ আপনার রোজা ও ইবাদত কবুল করুন।"\n২. "আপনার ও আপনার পরিবারের জন্য রইল ঈদের অনেক অনেক শুভেচ্ছা। ঈদ মোবারক!"'
  },
  {
    id: 6,
    question: 'সেমাই রান্নার একটি সহজ রেসিপি বলুন।',
    answer: 'ঘি-তে সেমাই হালকা ভেজে নিন। এরপর দুধ, চিনি, এলাচ, দারুচিনি দিয়ে ফুটিয়ে নিন। ঘন হয়ে এলে বাদাম ও কিসমিস ছড়িয়ে পরিবেশন করুন।'
  },
  {
    id: 7,
    question: 'ঈদের দিন কি কি খাবার রান্না করা যায়?',
    answer: 'সেমাই, জর্দা, পোলাও, রোস্ট, গরুর মাংসের রেজালা, চটপটি, এবং বোরহানি ঈদের জনপ্রিয় খাবার।'
  },
  {
    id: 8,
    question: 'ঈদের নামাজের পর কি কি দোয়া পড়া উচিত?',
    answer: 'ঈদের নামাজের পর নির্দিষ্ট কোনো দোয়া নেই, তবে "তাকাব্বালাল্লাহু মিন্না ওয়া মিনকুম" (আল্লাহ আমাদের ও আপনাদের পক্ষ থেকে কবুল করুন) বলা সুন্নত।'
  },
  {
    id: 9,
    question: 'ঈদের দিন সকালে কি খাওয়া সুন্নত?',
    answer: 'ঈদুল ফিতরের দিন সকালে ঈদগাহে যাওয়ার আগে মিষ্টি জাতীয় খাবার, বিশেষ করে খেজুর বিজোড় সংখ্যায় খাওয়া সুন্নত।'
  },
  {
    id: 10,
    question: 'ঈদুল আযহায় কি খেয়ে ঈদগাহে যাওয়া সুন্নত?',
    answer: 'ঈদুল আযহায় কিছু না খেয়ে ঈদগাহে যাওয়া এবং কোরবানির গোশত দিয়ে প্রথম খাবার খাওয়া সুন্নত।'
  },
  {
    id: 11,
    question: 'ঈদের নামাজে কি আজান ও ইকামত আছে?',
    answer: 'না, ঈদের নামাজে কোনো আজান বা ইকামত নেই।'
  },
  {
    id: 12,
    question: 'ঈদের খুতবা কখন দেওয়া হয়?',
    answer: 'ঈদের খুতবা নামাজের পর দেওয়া হয়, যা শোনা মুস্তাহাব। জুমার নামাজের মতো আগে নয়।'
  },
  {
    id: 13,
    question: 'মহিলাদের ঈদের নামাজ পড়ার নিয়ম কি?',
    answer: 'মহিলারা চাইলে ঘরে একাকী বা জামাতে ঈদের নামাজ পড়তে পারেন, তবে ঈদগাহে যাওয়ার সুযোগ ও নিরাপদ পরিবেশ থাকলে সেখানেও যেতে পারেন।'
  },
  {
    id: 14,
    question: 'ঈদের দিন রোজা রাখা কি জায়েজ?',
    answer: 'না, ঈদুল ফিতর এবং ঈদুল আযহার দিন রোজা রাখা হারাম।'
  },
  {
    id: 15,
    question: 'তাকবিরে তাশরিক কি এবং কখন পড়তে হয়?',
    answer: 'ঈদুল আযহার সময় ৯ জিলহজ ফজর থেকে ১৩ জিলহজ আসর পর্যন্ত প্রত্যেক ফরজ নামাজের পর একবার "আল্লাহু আকবার, আল্লাহু আকবার, লা ইলাহা ইল্লাল্লাহু ওয়াল্লাহু আকবার, আল্লাহু আকবার, ওয়া লিল্লাহিল হামদ" পড়া ওয়াজিব।'
  },
  {
    id: 16,
    question: 'ফিতরা কখন আদায় করা উত্তম?',
    answer: 'ঈদের নামাজের আগে ফিতরা আদায় করা উত্তম, তবে ঈদের দিন সকালে বা রমজান মাসেও দেওয়া যায়।'
  },
  {
    id: 17,
    question: 'ফিতরা কি টাকা দিয়ে দেওয়া যায়?',
    answer: 'হ্যাঁ, ফিতরা খাদ্যদ্রব্যের সমমূল্যের টাকা দিয়েও দেওয়া যায়।'
  },
  {
    id: 18,
    question: 'কোরবানির গোশত কিভাবে বণ্টন করতে হয়?',
    answer: 'কোরবানির গোশত তিন ভাগে ভাগ করা মুস্তাহাব: এক ভাগ নিজের জন্য, এক ভাগ আত্মীয়-স্বজনের জন্য এবং এক ভাগ গরিব-দুঃখীদের জন্য।'
  },
  {
    id: 19,
    question: 'মৃত ব্যক্তির নামে কোরবানি দেওয়া কি জায়েজ?',
    answer: 'হ্যাঁ, মৃত ব্যক্তির সওয়াবের উদ্দেশ্যে কোরবানি দেওয়া জায়েজ।'
  },
  {
    id: 20,
    question: 'ঋণ করে কোরবানি দেওয়া কি ঠিক?',
    answer: 'কোরবানি ওয়াজিব হওয়ার জন্য নিসাব পরিমাণ সম্পদ থাকা শর্ত। ঋণ করে কোরবানি দেওয়া জরুরি নয়, তবে কেউ চাইলে দিতে পারে।'
  },
  {
    id: 21,
    question: 'ঈদের দিন মুসাফাহা ও মুয়ানাকা করার বিধান কি?',
    answer: 'ঈদের দিন আনন্দ প্রকাশার্থে মুসাফাহা (হাত মেলানো) ও মুয়ানাকা (কোলাকুলি) করা জায়েজ এবং এটি একটি সুন্দর সামাজিক রীতি।'
  },
  {
    id: 22,
    question: 'ঈদের চাঁদ দেখার দোয়া কি?',
    answer: '"আল্লাহুম্মা আহিল্লাহু আলাইনা বিল আমনি ওয়াল ঈমান, ওয়াস সালামাতি ওয়াল ইসলাম, রাব্বি ওয়া রাব্বুকাল্লাহ।"'
  },
  {
    id: 23,
    question: 'ঈদের দিন নতুন কাপড় পরা কি বাধ্যতামূলক?',
    answer: 'বাধ্যতামূলক নয়, তবে সামর্থ্য থাকলে পরিষ্কার বা নতুন কাপড় পরা সুন্নত।'
  },
  {
    id: 24,
    question: 'কোরবানি কার ওপর ওয়াজিব?',
    answer: 'ঈদুল আযহার দিনগুলোতে যার কাছে নিত্যপ্রয়োজনীয় জিনিসের অতিরিক্ত নিসাব পরিমাণ সম্পদ থাকে, তার ওপর কোরবানি ওয়াজিব।'
  },
  {
    id: 25,
    question: 'এক গরুতে কতজন শরিক হতে পারে?',
    answer: 'একটি গরু, মহিষ বা উটে সর্বোচ্চ সাতজন শরিক হতে পারে।'
  },
  {
    id: 26,
    question: 'কোরবানির পশুর চামড়া কি বিক্রি করা যায়?',
    answer: 'নিজের ব্যবহারের জন্য রাখা যায়, তবে বিক্রি করলে সেই টাকা গরিবদের দান করে দেওয়া ওয়াজিব।'
  },
  {
    id: 27,
    question: 'ঈদের দিন কবর জিয়ারত করা কি সুন্নত?',
    answer: 'ঈদের দিন বিশেষভাবে কবর জিয়ারতের কোনো সহিহ হাদিস নেই, তবে সাধারণ দিনগুলোর মতো যেকোনো দিন কবর জিয়ারত করা যায়।'
  },
  {
    id: 28,
    question: 'ঈদের নামাজ ছুটে গেলে কি করণীয়?',
    answer: 'ঈদের নামাজ ছুটে গেলে তা কাজা করার সুযোগ নেই। তবে চার রাকাত নফল নামাজ (চাশতের নামাজ) পড়ে নেওয়া ভালো।'
  },
  {
    id: 29,
    question: 'ঈদে বাচ্চাদের সালামি দেওয়ার ইসলামিক বিধান কি?',
    answer: 'এটি একটি সুন্দর সামাজিক প্রথা যা বাচ্চাদের আনন্দ দেয়। ইসলামে উপহার দেওয়াকে উৎসাহিত করা হয়েছে, তাই এটি সম্পূর্ণ জায়েজ।'
  }
];

const EidJiggasa: React.FC<EidJiggasaProps> = ({ isOpen, onClose }) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-night-blue/95 sm:bg-night-blue/80 sm:backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 100 }}
            className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md h-[85vh] flex flex-col overflow-hidden border-4 border-eid-gold/20 force-gpu"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-eid-green to-emerald-900 p-6 text-white flex justify-between items-center relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 p-2 opacity-10 rotate-12">
                <Sparkles size={100} />
              </div>
              
              <div className="flex items-center gap-3 relative z-10">
                <div className="bg-white/20 p-2.5 rounded-2xl sm:backdrop-blur-md border border-white/20">
                  <HelpCircle size={24} className="text-eid-gold" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-none bengali-text">ঈদ জিজ্ঞাসা</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] opacity-70 uppercase tracking-widest font-bold">সাধারণ প্রশ্ন ও উত্তর</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={onClose} 
                className="hover:bg-white/20 p-2 rounded-full transition-colors relative z-10"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-eid-cream/30">
              <div className="text-center mb-6 mt-2">
                <p className="text-sm text-eid-green/80 font-medium bengali-text">
                  ঈদ সংক্রান্ত আপনার যেকোনো সাধারণ প্রশ্নের উত্তর এখানে পাবেন।
                </p>
              </div>

              {QA_LIST.map((qa) => (
                <motion.div 
                  key={qa.id}
                  className="bg-white rounded-2xl border border-eid-gold/20 shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => toggleExpand(qa.id)}
                    className="w-full text-left p-4 flex items-center justify-between hover:bg-eid-gold/5 transition-colors"
                  >
                    <span className="font-bold text-eid-green text-sm bengali-text pr-4">{qa.question}</span>
                    <motion.div
                      animate={{ rotate: expandedId === qa.id ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0 text-eid-gold"
                    >
                      <ChevronDown size={20} />
                    </motion.div>
                  </button>
                  
                  <AnimatePresence>
                    {expandedId === qa.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="p-4 pt-0 text-sm text-gray-700 bengali-text leading-relaxed border-t border-eid-gold/10 bg-eid-gold/5 whitespace-pre-line">
                          {qa.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
              
              <div className="h-4" /> {/* Bottom padding */}
            </div>
            
            {/* Footer */}
            <div className="p-4 bg-white border-t border-eid-gold/10 shrink-0">
              <p className="text-[9px] text-center text-gray-400 uppercase tracking-widest font-medium">
                Eid Celebration 2026 • FAQ
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EidJiggasa;
