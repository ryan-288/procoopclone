<?php

	$inData = getRequestInfo();
	
	$conn = new mysqli("localhost", "TheBeast", "Data=cool", "ContactMgr"); 	
	if( $conn->connect_error )
	{
		returnWithError( $conn->connect_error );
	}
	else
	{
		// Check if username already exists
		$stmt = $conn->prepare("SELECT UserID FROM Users WHERE Username=?");
		$stmt->bind_param("s", $inData["username"]);
		$stmt->execute();
		$result = $stmt->get_result();

		if( $result->fetch_assoc() )
		{
			returnWithError("Username already exists");
		}
		else
		{
			// Hash the password with bcrypt
			$hashedPassword = password_hash($inData["password"], PASSWORD_BCRYPT);
			
			// Insert new user
			$stmt = $conn->prepare("INSERT INTO Users (FirstName, LastName, Username, PasswordHash) VALUES (?, ?, ?, ?)");
			$stmt->bind_param("ssss", $inData["firstName"], $inData["lastName"], $inData["username"], $hashedPassword);
			
			if( $stmt->execute() )
			{
				$newUserId = $conn->insert_id;
				returnWithInfo( $inData["firstName"], $inData["lastName"], $newUserId );
			}
			else
			{
				returnWithError("Registration failed: " . $stmt->error);
			}
		}

		$stmt->close();
		$conn->close();
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
		$retValue = '{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
	function returnWithInfo( $firstName, $lastName, $id )
	{
		$retValue = '{"id":' . $id . ',"firstName":"' . $firstName . '","lastName":"' . $lastName . '","error":""}';
		sendResultInfoAsJson( $retValue );
	}
	
?>