
import React from 'react';
import { Room } from './types';

export const ROOMS: Room[] = [
  {
    id: 'deluxeocean',
    name: 'Atlantic Coast Suite',
    description: 'Breathtaking views of the Atlantic Ocean paired with refined Ghanaian artistry and contemporary comfort.',
    price: 450,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwcYxZv0peHwhu-5zFR5b1mtFFBUMTpC5LJLEMmy10yLGdcXBWmlIHYlz5s893HRIP-JzLENQP5kEDlzMfFyuZGgvP8xX7zrfa8VD1bQO8MerWjhg1bTw4ikeznJqGbozOWm15JLJDC34XkV5dL5cF4Z9owpkVzePm4X5UydijROXfrMK_9NU4EZvlJ1UnG6INRtFuVRXUQ0yOeFILtHwLorhTbR6nXUxqFfEMlTCiWQ0Zw1MWKAuQl8GuJasHL1G3_2pkkyxeD0Y',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDwcYxZv0peHwhu-5zFR5b1mtFFBUMTpC5LJLEMmy10yLGdcXBWmlIHYlz5s893HRIP-JzLENQP5kEDlzMfFyuZGgvP8xX7zrfa8VD1bQO8MerWjhg1bTw4ikeznJqGbozOWm15JLJDC34XkV5dL5cF4Z9owpkVzePm4X5UydijROXfrMK_9NU4EZvlJ1UnG6INRtFuVRXUQ0yOeFILtHwLorhTbR6nXUxqFfEMlTCiWQ0Zw1MWKAuQl8GuJasHL1G3_2pkkyxeD0Y',
      'https://images.unsplash.com/photo-1590490359683-658d3d23f972?q=80&w=2000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=2000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=2000&auto=format&fit=crop'
    ],
    rating: 4.9,
    reviewsCount: 128,
    size: '65m²',
    guests: '2 Adults',
    view: 'Ocean View',
    category: 'Deluxe',
    floor: 'Second Floor',
    amenities: ['65" Smart TV', 'Nespresso Machine', 'Rain Shower', 'WiFi'],
    isBestSeller: true
  },
  {
    id: 'presidentialwing',
    name: 'The Gold Coast Wing',
    description: 'Our most prestigious residence offering panoramic views of Accra and a dedicated butler trained in elite service.',
    price: 1200,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6Ha5GBfwFv_a151sHtFeFV8FL52KHBtOFuJax6_SUWaqZEsN3cEmFXagNyVwyYvr14NneQyXpBRcfuzIq776PCuUgWcn0LSW4IWfm373wcKanSonNtb2fn86NTaMxDVHvheYT7PwrYwlMVPkAhq0aD6AiyrdfXgRusn2rcOTsgFUg6IzkBQ9N4Ht0Xx_xOu8SgfdQVr772xSUTuqb4u14i0iV4EeDWKeSOoo4E9114kkglCUlDwPR5ble4LDEMbcSzg-UV5Su4Ks',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB6Ha5GBfwFv_a151sHtFeFV8FL52KHBtOFuJax6_SUWaqZEsN3cEmFXagNyVwyYvr14NneQyXpBRcfuzIq776PCuUgWcn0LSW4IWfm373wcKanSonNtb2fn86NTaMxDVHvheYT7PwrYwlMVPkAhq0aD6AiyrdfXgRusn2rcOTsgFUg6IzkBQ9N4Ht0Xx_xOu8SgfdQVr772xSUTuqb4u14i0iV4EeDWKeSOoo4E9114kkglCUlDwPR5ble4LDEMbcSzg-UV5Su4Ks',
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=2000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=2000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=2000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=2000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2000&auto=format&fit=crop'
    ],
    rating: 5.0,
    reviewsCount: 45,
    size: '210m²',
    guests: '4 Adults',
    view: 'Accra Skyline',
    category: 'Presidential',
    floor: 'Penthouse Level',
    amenities: ['Butler Service', 'Walk in Closet'],
    isElite: true
  },
  {
    id: 'gardenvilla',
    name: 'Spintex Garden Villa',
    description: 'A secluded botanical escape within the city surrounded by indigenous flora and private serene balconies.',
    price: 850,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7tH3BDJHKEXfqgbXXoM44mgzAcTYJpfR3RxrK8e-Xnr2Q1XimBkNW5acYqztzCkl79OmtaanrIvttZBmOlVCyDiISseW5RNfngtXNTvkQ3hWhMhEWO7ZxbmjX2aJuWta_1aS-_zduAN-NHoqrowVBdSEWeyExbAmV4AMtXn7ShGPA69_w9yCl6Q0rL1mGzxGbXdpswpV4B0sJivZPeyKfCYOghu3mBG8XNAJSPR9qAKDJzTWH9k5yS17Za7mMzvygYAgH8LqPNHY',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB7tH3BDJHKEXfqgbXXoM44mgzAcTYJpfR3RxrK8e-Xnr2Q1XimBkNW5acYqztzCkl79OmtaanrIvttZBmOlVCyDiISseW5RNfngtXNTvkQ3hWhMhEWO7ZxbmjX2aJuWta_1aS-_zduAN-NHoqrowVBdSEWeyExbAmV4AMtXn7ShGPA69_w9yCl6Q0rL1mGzxGbXdpswpV4B0sJivZPeyKfCYOghu3mBG8XNAJSPR9qAKDJzTWH9k5yS17Za7mMzvygYAgH8LqPNHY',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=2000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=2000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590490359683-658d3d23f972?q=80&w=2000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2000&auto=format&fit=crop'
    ],
    rating: 4.8,
    reviewsCount: 89,
    size: '120m²',
    guests: '2 Adults',
    view: 'Private Garden',
    category: 'Villa',
    floor: 'Ground Floor',
    amenities: ['Private Garden', 'Outdoor Shower']
  },
  {
    id: 'executiveskyline',
    name: 'Independence Skyline Suite',
    description: 'A sophisticated corner suite featuring sweeping views of the city horizon and bespoke local furniture.',
    price: 550,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUJFJTTiTBWlmVz8dor-Cg7_1rBgiDeV2lkB588AjBK95qdLMvml41jTfoZuzfWMZiJZuz45ObJMNNfPfWcXFM9Dqm8M5EyOha1WfurXHl9DvP1tSOxjyEnWokCfiVRv8Ws6VO0HHoioOz1KuRmoxqZ-YGocMaWJLEfo7LfwWZVCyXKwk_Q__QPXn-qMCQMQGdOggXWMOIZql285S8a9oNsUP-Iy9_dYyc-sRp8xaFGZ5E60XWJXPryxTZIwZMuuRPokd58Pg-IWE',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBUJFJTTiTBWlmVz8dor-Cg7_1rBgiDeV2lkB588AjBK95qdLMvml41jTfoZuzfWMZiJZuz45ObJMNNfPfWcXFM9Dqm8M5EyOha1WfurXHl9DvP1tSOxjyEnWokCfiVRv8Ws6VO0HHoioOz1KuRmoxqZ-YGocMaWJLEfo7LfwWZVCyXKwk_Q__QPXn-qMCQMQGdOggXWMOIZql285S8a9oNsUP-Iy9_dYyc-sRp8xaFGZ5E60XWJXPryxTZIwZMuuRPokd58Pg-IWE',
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=2000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=2000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=2000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=2000&auto=format&fit=crop'
    ],
    rating: 5.0,
    reviewsCount: 62,
    size: '72m²',
    guests: '3 Guests',
    view: 'City Skyline',
    category: 'Executive',
    floor: 'Fourth Floor',
    amenities: ['Office Desk', 'Premium Bar', 'Dual Vanities']
  }
];
