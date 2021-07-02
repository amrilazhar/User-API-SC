# User-API-SC
This project is intended to complete the assignment for Sejuta Cita API CRUD User and Login with additional feature which is refresh token

## Architecture Design
This section consist of 3 part, which are Database Design, Aplication Flow, and Kubernetes Design/Architecture.
### __1. Database Design__
This is the design of the user API
![db_diagram](https://ik.imagekit.io/payp7gr62rv/db_design_user_sejuta_cita_9iduZQjWH.PNG)

### __2 Application Flow__
This is the sequence diagram about the Application flow, there is 3 part :

#### __2.a Auth Flow__
Basic Feature : 
1. Sign Up
2. Login
3. Refresh Token
4. Revoke Token

![seq_auth](https://ik.imagekit.io/payp7gr62rv/Sequence_diagram_-ol1xYijbl-O.png)
#### __2.b Admin Flow__

Basic Feature : 
1. Get Users List
2. Get User Profile
3. Refresh Token Lists
4. Register User
5. Delete User

![seq_admin](https://ik.imagekit.io/payp7gr62rv/Admin_Flow_TqqmoToESSzn.png)
#### __2.c User Flow__
Basic Feature : 
1. Get Profile
2. Change Profile
3. Change Password
4. Close Account

![seq_user](https://ik.imagekit.io/payp7gr62rv/db_design_user_sejuta_cita_9iduZQjWH.PNG)
### __3. Kubernetes Design__
This is the design of kubernetes node and pods
## Instalation

For installing the API firts you must prepare `.env.production` file before running the `DockerFile`, the env file consist of :
```
MONGO_URI = <database-location>
JWT_SECRET = <secret>
PORT=<app port>
DEFAULT_PASSWORD = <default password for register user>
```
and then we can start build the image using `docker build` command, and push the image to docker hub or google cloud platform. 
## Documentation
Documentation of this project can be accessed in [Postman Documentation](https://documenter.getpostman.com/view/15024355/TzkyP1Yb)

## Credentials Account Info

__Admin Credentials__ 

username : iamadmin2

password : Admin1234!!

__User Credentials__

username : sejutacita

password : User1234!!

## Credits
1. Thanks to this blog [jason wattmore](https://jasonwatmore.com/post/2020/06/17/nodejs-mongodb-api-jwt-authentication-with-refresh-tokens) for the explanation about refresh token algorithm.
2. Udemy course [Docker Mastery with Kubernates and Swarm](https://www.udemy.com/share/101WlG2@PW5jfVpcS1EIckRAAmJnfQ==/) by Brett Fischer