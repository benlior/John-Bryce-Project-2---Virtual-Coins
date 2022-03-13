# John-Bryce-Project-2---Virtual-Coins

This website was made by Lior Ben by following the course - "Full-Stack Web Development Bootcamp". 
<br>

<img width="1426" alt="Screen Shot 2022-01-10 at 19 25 07" src="https://user-images.githubusercontent.com/81048007/148810789-c1f4cca4-dfcc-4559-adac-455a9ece0e68.png">

<br>

The aim of this project is to provide real-time information regarding virtual coin values.
<br>
Upon entering the page, an Ajax request is sent to retrieve all virtual coins.
<br>
Clicking "Live Reports" after adding a coin shows a real-time coin value chart.
<br>
This is updated every 2 seconds by sending an Ajax request and adding the new value to the chart.
<br>
Clicking "More Info" obtains additional coin information via Ajax and adds it to the local storage, along with the click time.
<br>
If 2 minutes have not yet passed since the last click - the information will be drawn from the local storage.
<br>
Otherwise, a new Ajax request will be sent and overwrite the saved information in the local storage.
