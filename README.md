<img width="1452" alt="截圖 2023-03-12 下午4 44 05" src="https://user-images.githubusercontent.com/75289113/224533977-2a80c2e8-7f35-483e-bd48-ebc9d8f4fa18.png">



# Taipei-Day-Trip
Taipei-Day-Trip is an e-commerce website that allows users to search for and book one-day tour trips in Taipei City.

Website URL: http://13.112.131.32:3000/

Test account: admin@gmail.com

Test password: Admin123

Test Credit Card Information:
- Credit Card number（卡片號碼）: 4242 4242 4242 4242
- Credit Card Expiration Dates （過期時間）: 02/42
- Credit Card CVV Code （驗證密碼）: 424

# Table of Contents
- [Demo](#demo)
- [Main Features](#main-features)
- [Frontend Technique](#frontend-technique)
- [Backend Technique]((#backend-technique))
  - [Environment](#environment)
  - [Database](#database)
  - [Cloud Services](#cloud-services)
  - [Version Control](#version-control)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Doc](#api-doc)
- [Contact](#contact)

# Demo
### Infinite Scroll Attractions and Attraction Image Carousel with Preloader
![home](https://user-images.githubusercontent.com/75289113/224555787-d9ac4644-2650-43ab-8e3b-4f702b035e62.gif)


### Booking a Trip and Checking in Shopping Cart
![booking](https://user-images.githubusercontent.com/75289113/224556017-4a2591c3-3141-4dbb-b513-95d32e22f7c3.gif)


### Ordering a Trip and Reviewing the Order History
![order](https://user-images.githubusercontent.com/75289113/224555551-b4e7feba-d1c7-43ec-9f49-9224928b243d.gif)


# Main Features
[(back to top)](#table-of-contents)

- Attraction
  - Ability for user to search for related attractions with keywords.
  - Implementation of infinite scroll with lazy loading for faster page loading experience.
  - Custom image carousel for showcasing attractions.

- Membership System
  - User membership system with regex form validation to ensure data accuracy.
  - Member verification uses JSON Web Tokens.
  - Order history review functionality for users to view both upcoming and past bookings.

- Order and payment
  - Shopping cart system for adding and managing selected items.
  - Online payment system with [Tappay](https://www.tappaysdk.com/en/) for easy and secure transactions.


# Frontend Technique
[(back to top)](#table-of-contents)

- HTML
- Javascript
- CSS (Stylus) applied BEM methodology
- RWD
- AJAX

# Backend Technique
[(back to top)](#table-of-contents)

### Key Points
- JWT authentication
- Third-party Payment Service
- MVC Pattern
- Third normal form (3NF)

### Environment
- Python (flask)
### Database
- MySQL
### Cloud Services
- EC2
### Third Party Library
- bcrypt
### Version Control
- Git/GitHub

# Architecture
[(back to top)](#table-of-contents)

<img width="860" alt="截圖 2023-03-12 下午6 09 50" src="https://user-images.githubusercontent.com/75289113/224537984-405262b5-1d5e-42b7-a15a-b63428b661be.png">

# Database Schema
[(back to top)](#table-of-contents)


- Third normal form (3NF)

![截圖 2023-03-14 上午1 24 02](https://user-images.githubusercontent.com/75289113/224778917-fa2bc9fa-dfa6-4f86-b713-7bed74038480.png)


# API Doc
[(back to top)](#table-of-contents)

[API Doc](https://app.swaggerhub.com/apis-docs/padax/taipei-day-trip/1.1.0)

# Contact
Developer: Sheng-Wei, Peng (Finley Peng)

Email: weilllyox1020@gmail.com

Linkedin: [Finley Peng](https://www.linkedin.com/in/sheng-wei-finley-peng-9015931b2/)
