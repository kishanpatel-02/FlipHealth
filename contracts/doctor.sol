pragma solidity ^0.8.0;
import "./patient.sol";

contract doctor is patient {
    // Registers doctor on the blockchain
    function registerDoctor(
        uint128 _abhaId,
        uint128 _aadharId,
        string memory _name,
        uint16 _age,
        uint64 _grNum,
        uint128 _mobile,
        string memory _email,
        string memory _degreeName
    ) public {
        doctors.push(msg.sender);
        doctorIndex[msg.sender] = Doctor(
            _abhaId,
            _aadharId,
            _name,
            _age,
            _grNum,
            _mobile,
            _email,
            _degreeName
        );
    }

    // Returns doctor profile of the sender
    function getDocOwnProfile() external view returns (Doctor memory) {
        return doctorIndex[msg.sender];
    }

    // Returns profile of all the patients of the user
    function getPatients() external view returns (PatientProfile[] memory) {
        uint patientCount = accessList[msg.sender].length;
        // add a response if patientCount is 0
        PatientProfile[] memory patients = new PatientProfile[](patientCount);
        for (uint i = 0; i < patientCount; i++) {
            patients[i] = getPatientProfile(accessList[msg.sender][i]);
        }
        return patients;
    }

    // Returns healthrecords of the patient if authorized
    function getHealthRecords(
        address patAddress
    ) public view returns (HealthRecord[] memory) {
        require(isAuthorized(patAddress, msg.sender), "unauthorized");
        return userRecords[patAddress];
    }

    // Returns profiles of all doctors on the blockchain
    function getAllDoctors() external view returns (DocProfile[] memory) {
        uint256 numDoctors = doctors.length;
        DocProfile[] memory allDoctors = new DocProfile[](numDoctors);
        for (uint256 i = 0; i < numDoctors; i++) {
            address doctorAddress = doctors[i];
            allDoctors[i] = DocProfileReturn(doctorAddress);
        }
        return allDoctors;
    }

    // Returns profiles of all doctors authorized by the user
    function getDoctorsForUser() external view returns (DocProfile[] memory) {
        uint count = 0;
        DocProfile[] memory authDoctors = new DocProfile[](50);
        for (uint i = 0; i < doctors.length; i++) {
            if (isAuthorized(msg.sender, doctors[i])) {
                authDoctors[count] = DocProfileReturn(doctors[i]);
                count++;
            }
        }
        return (authDoctors);
    }
}
