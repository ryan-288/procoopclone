<?php
	$inData = getRequestInfo();
	
	$firstName = $inData["firstName"];
    $lastName = $inData["lastName"];
    $phone = $inData["phone"];
    $email = $inData["email"];
	$userId = $inData["userId"];

	$conn = new mysqli("localhost", "TheBeast", "Data=cool", "ContactMgr");
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
		$stmt = $conn->prepare("INSERT INTO Contacts (UserId, FirstName, LastName, Phone, Email) VALUES(?,?,?,?,?)");
		$stmt->bind_param("sssss", $userId, $firstName, $lastName, $phone, $email);
		$stmt->execute();
		$stmt->close();
		$conn->close();
		returnWithError("");    
	}

	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}
	
	function returnWithError( $err )
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
