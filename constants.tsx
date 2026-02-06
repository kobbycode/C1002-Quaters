
import React from 'react';
import { Room } from './types';

export const ROOMS: Room[] = [
  {
    id: 'deluxeocean',
    name: 'Atlantic Coast Suite',
    description: 'Breathtaking views of the Atlantic Ocean paired with refined Ghanaian artistry and contemporary comfort.',
    price: 450,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwcYxZv0peHwhu-5zFR5b1mtFFBUMTpC5LJLEMmy10yLGdcXBWmlIHYlz5s893HRIP-JzLENQP5kEDlzMfFyuZGgvP8xX7zrfa8VD1bQO8MerWjhg1bTw4ikeznJqGbozOWm15JLJDC34XkV5dL5cF4Z9owpkVzePm4X5UydijROXfrMK_9NU4EZvlJ1UnG6INRtFuVRXUQ0yOeFILtHwLorhTbR6nXUxqFfEMlTCiWQ0Zw1MWKAuQl8GuJasHL1G3_2pkkyxeD0Y',
    rating: 4.9,
    reviewsCount: 128,
    size: '65m²',
    guests: '2 Adults',
    view: 'Ocean View',
    category: 'Deluxe',
    amenities: ['65" Smart TV', 'Nespresso Machine', 'Rain Shower', 'WiFi'],
    isBestSeller: true
  },
  {
    id: 'presidentialwing',
    name: 'The Gold Coast Wing',
    description: 'Our most prestigious residence offering panoramic views of Accra and a dedicated butler trained in elite service.',
    price: 1200,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6Ha5GBfwFv_a151sHtFeFV8FL52KHBtOFuJax6_SUWaqZEsN3cEmFXagNyVwyYvr14NneQyXpBRcfuzIq776PCuUgWcn0LSW4IWfm373wcKanSonNtb2fn86NTaMxDVHvheYT7PwrYwlMVPkAhq0aD6AiyrdfXgRusn2rcOTsgFUg6IzkBQ9N4Ht0Xx_xOu8SgfdQVr772xSUTuqb4u14i0iV4EeDWKeSOoo4E9114kkglCUlDwPR5ble4LDEMbcSzg-UV5Su4Ks',
    rating: 5.0,
    reviewsCount: 45,
    size: '210m²',
    guests: '4 Adults',
    view: 'Accra Skyline',
    category: 'Presidential',
    amenities: ['Butler Service', 'Walk in Closet'],
    isElite: true
  },
  {
    id: 'gardenvilla',
    name: 'Spintex Garden Villa',
    description: 'A secluded botanical escape within the city surrounded by indigenous flora and private serene balconies.',
    price: 850,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7tH3BDJHKEXfqgbXXoM44mgzAcTYJpfR3RxrK8e-Xnr2Q1XimBkNW5acYqztzCkl79OmtaanrIvttZBmOlVCyDiISseW5RNfngtXNTvkQ3hWhMhEWO7ZxbmjX2aJuWta_1aS-_zduAN-NHoqrowVBdSEWeyExbAmV4AMtXn7ShGPA69_w9yCl6Q0rL1mGzxGbXdpswpV4B0sJivZPeyKfCYOghu3mBG8XNAJSPR9qAKDJzTWH9k5yS17Za7mMzvygYAgH8LqPNHY',
    rating: 4.8,
    reviewsCount: 89,
    size: '120m²',
    guests: '2 Adults',
    view: 'Private Garden',
    category: 'Villa',
    amenities: ['Private Garden', 'Outdoor Shower']
  },
  {
    id: 'executiveskyline',
    name: 'Independence Skyline Suite',
    description: 'A sophisticated corner suite featuring sweeping views of the city horizon and bespoke local furniture.',
    price: 550,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUJFJTTiTBWlmVz8dor-Cg7_1rBgiDeV2lkB588AjBK95qdLMvml41jTfoZuzfWMZiJZuz45ObJMNNfPfWcXFM9Dqm8M5EyOha1WfurXHl9DvP1tSOxjyEnWokCfiVRv8Ws6VO0HHoioOz1KuRmoxqZ-YGocMaWJLEfo7LfwWZVCyXKwk_Q__QPXn-qMCQMQGdOggXWMOIZql285S8a9oNsUP-Iy9_dYyc-sRp8xaFGZ5E60XWJXPryxTZIwZMuuRPokd58Pg-IWE',
    rating: 5.0,
    reviewsCount: 62,
    size: '72m²',
    guests: '3 Guests',
    view: 'City Skyline',
    category: 'Executive',
    amenities: ['Office Desk', 'Premium Bar', 'Dual Vanities']
  }
];
