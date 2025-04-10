// seed.js
require('dotenv').config(); // Ensure environment variables are loaded

const mongoose = require('mongoose');
const Car = require('./models/Car'); // Adjust the path if needed

console.log('MONGO_URI:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB.');

    // Optional: Clear existing car data for a clean seed
    await Car.deleteMany({});

    const dummyCars = [
      {
        brand: "Toyota",
        model: "RAV4",
        group: "SUV",
        engineSize: 2000,
        doors: 4,
        passengers: 5,
        fuelType: "Gasoline",
        gearbox: "Automatic",
        hasAC: true,
        electricWindows: true,
        image: "https://example.com/toyota-rav4.jpg",
        dailyPrice: 75
      },
      {
        brand: "Tesla",
        model: "Model 3",
        group: "Electric",
        engineSize: 0,
        doors: 4,
        passengers: 5,
        fuelType: "Electric",
        gearbox: "Automatic",
        hasAC: true,
        electricWindows: true,
        image: "https://example.com/tesla-model3.jpg",
        dailyPrice: 120
      },
      {
        brand: "Honda",
        model: "Civic",
        group: "Convertible",
        engineSize: 2500,
        doors: 2,
        passengers: 2,
        fuelType: "Gasoline",
        gearbox: "Automatic",
        hasAC: true,
        electricWindows: true,
        image: "https://example.com/honda-civic.jpg",
        dailyPrice: 65
      },
      {
        brand: "Ford",
        model: "F-150",
        group: "Truck",
        engineSize: 3500,
        doors: 2,
        passengers: 3,
        fuelType: "Gasoline",
        gearbox: "Automatic",
        hasAC: true,
        electricWindows: false,
        image: "https://example.com/ford-f150.jpg",
        dailyPrice: 95
      },
      {
        brand: "BMW",
        model: "3 Series",
        group: "Sedan",
        engineSize: 2000,
        doors: 4,
        passengers: 5,
        fuelType: "Gasoline",
        gearbox: "Automatic",
        hasAC: true,
        electricWindows: true,
        image: "https://example.com/bmw-3series.jpg",
        dailyPrice: 150
      },
      {
        brand: "Audi",
        model: "Q5",
        group: "SUV",
        engineSize: 2500,
        doors: 4,
        passengers: 5,
        fuelType: "Gasoline",
        gearbox: "Automatic",
        hasAC: true,
        electricWindows: true,
        image: "https://example.com/audi-q5.jpg",
        dailyPrice: 140
      },
      {
        brand: "Nissan",
        model: "Leaf",
        group: "Electric",
        engineSize: 0,
        doors: 4,
        passengers: 5,
        fuelType: "Electric",
        gearbox: "Automatic",
        hasAC: true,
        electricWindows: true,
        image: "https://example.com/nissan-leaf.jpg",
        dailyPrice: 85
      },
      {
        brand: "Mercedes-Benz",
        model: "C-Class",
        group: "Sedan",
        engineSize: 2200,
        doors: 4,
        passengers: 5,
        fuelType: "Gasoline",
        gearbox: "Automatic",
        hasAC: true,
        electricWindows: true,
        image: "https://example.com/mercedes-cclass.jpg",
        dailyPrice: 160
      }
    ];

    await Car.insertMany(dummyCars);
    console.log('Dummy data inserted successfully.');
  })
  .catch(err => {
    console.error('Error connecting or inserting data:', err);
  })
  .finally(() => {
    mongoose.connection.close();
  });
