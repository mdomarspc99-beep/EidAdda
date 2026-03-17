export interface PrayerTime {
  label: string;
  time: string;
}

export interface Mosque {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  prayerTimes: PrayerTime[];
  addedBy: string;
  updatedAt: any;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
