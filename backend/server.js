const express = require('express');
const bodyParser = require('body-parser');
const app =express();
app.use(bodyParser.json());

const PORT = 3000;

app.listen(PORT,()=>{
    console.log(`Server us running on port : ${PORT}`);  
});

let rooms = [];
let bookings =[];
let roomIdCounter =1;
let bookingIdCounter = 1;

//function to check if the room is available or not
function isRoomAvailable(roomId,date,startTime,endTime){
    return !bookings.some(booking =>
        booking.roomId ===roomId &&
        booking.date === date &&
        ((startTime>=booking.startTime && endTime <= booking.endTime) ||
        (endTime > booking.startTime && endTime <= booking.endTime) ||
        (startTime <= booking.startTime && endTime >= booking.endTime))
    );
}

//Create Room
app.post('/rooms',(req,res)=>{
    const {seats,amenities,oricePerHour} = req.body;
    if(!seats || !amenities || !pricePerHour){
        return res.status(400).json({error:'Missing required fields'});
    }
    const roomId = roomIdCounter++;
    rooms.push({roomId,seats,amenities,pricePerHour});
    res.status(201).json({roomId});
});
// 2. Book a Room
// Endpoint to book a room, checks for availability and creates a booking if available
app.post('/bookings', (req, res) => {
    const { customerName, date, startTime, endTime, roomId } = req.body;

    // Check if the room is available for the specified time
    if (!isRoomAvailable(roomId, date, startTime, endTime)) {
        return res.status(400).json({ error: 'Room is already booked for the specified time.' });
    }

    // Create a new booking
    const booking = {
        bookingId: bookingIdCounter++, // Generate a unique booking ID
        customerName,
        date,
        startTime,
        endTime,
        roomId,
        bookingDate: new Date().toISOString(), // Record the current date and time
        bookingStatus: 'Confirmed' // Set the booking status to Confirmed
    };

    bookings.push(booking);
    res.status(201).json(booking);
});

// 3. List all rooms with booked data
// Endpoint to list all rooms along with their booking details
app.get('/rooms', (req, res) => {
    const result = rooms.map(room => {
        const roomBookings = bookings.filter(booking => booking.roomId === room.roomId);
        return {
            ...room,
            bookings: roomBookings.map(booking => ({
                customerName: booking.customerName,
                date: booking.date,
                startTime: booking.startTime,
                endTime: booking.endTime

            }))
           
        };       
    });
    res.json(result);
});
// 4. List all customers with booked data
// Endpoint to list all customers along with their booking details
app.get('/customers', (req, res) => {
    // Get unique customer names from the bookings array
    const customers = [...new Set(bookings.map(booking => booking.customerName))];
    const result = customers.map(customerName => {
        const customerBookings = bookings.filter(booking => booking.customerName === customerName);
        return {
            customerName,
            bookings: customerBookings.map(booking => ({
                roomId: booking.roomId,
                date: booking.date,
                startTime: booking.startTime,
                endTime: booking.endTime
            }))
        };
    });
    res.json(result);
});

// 5. List how many times a customer has booked the room
// Endpoint to list all bookings made by a specific customer with detailed booking information
app.get('/customer/:customerName', (req, res) => {
    const { customerName } = req.params;
    const customerBookings = bookings.filter(booking => booking.customerName === customerName);
    const result = customerBookings.map(booking => ({
        customerName: booking.customerName,
        roomId: booking.roomId,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        bookingId: booking.bookingId,
        bookingDate: booking.bookingDate,
        bookingStatus: booking.bookingStatus
    }));
    res.json(result);
});

