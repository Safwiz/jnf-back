const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const sendEmail = require('./emailSender');
const { generateRandomString, hashPassword } = require('./util');
const { LocalStorage } = require('node-localstorage');
const localStorage = new LocalStorage('./scratch');

const app = express();
app.use(cors({origin:'http://localhost:3000'}));
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'jnf',
})

function getUserIDFromEmail(email, callback) {
  const query = 'SELECT id FROM users WHERE email = ?';
  db.query(query, [email], (error, results) => {
    if (error) {
      console.error('Error querying database:', error);
      callback(error, null);
    } else {
      if (results.length > 0) {
        callback(null, results[0].id); // Return the user ID
      } else {
        callback(null, null); // Return null if no user found with the given email
      }
    }
  });
}

app.get('/', (req, res) => {

    return res.json('Hello world!');
});

app.post ('/passCommande', (req, res) => {

    const reqData = req.body;
    const token = generateRandomString(15);
    const sql = "SELECT * FROM users WHERE email='" + reqData.email + "'";
    db.query(sql, (err, data) => {
        if (err) return res.json(err);
        if (data.length > 0) {
            getUserIDFromEmail(reqData.email, (error, userID) => {
                if (error) {
                    console.error('Error:', error);
                } else {
                    if (userID) {
                        const sql = "INSERT INTO commandes (user_id, date, lieu_depart, lieu_arrivee, description, confirmationToken) VALUES ('" + userID + "', '" + reqData.CommandDate + "', '" + reqData.CommandFrom + "', '" + reqData.CommandTo + "', '" + reqData.CommandDesc + "', '" + token + "')";
                        db.query(sql, (err, data) => {
                            if (err) return res.json(err);
                            const message = "Cher(e) "+ reqData.name +",<br></br>Nous vous remercions d'avoir choisi <strong>JN Freight</strong> pour votre commande récente. Nous apprécions votre confiance !<br></br><br></br>Nous vous prions de bien vouloir confirmer votre commande en cliquant sur le lien de confirmation fourni ci-dessous dans les 24 prochaines heures. Voici les détails de votre commande :<br></br><br></br><strong>Date de la Commande : </strong>" + reqData.CommandDate +"<br></br><strong>Lieu de départ : </strong>"+ reqData.CommandFrom +"<br></br><strong>Lieu d'arrivée :</strong> "+ reqData.CommandTo +"<br></br><br></br><strong>http://localhost:4000/confirmOrder?token="+ token +" (Ce lien expirera dans les 24 heures)</strong><br></br><br></br>Veuillez noter que si votre commande n'est pas confirmée dans les 24 prochaines heures, elle sera automatiquement annulée.<br></br><br></br>Après avoir confirmé votre commande, vous pourrez suivre son statut et son avancement sur votre espace client sur notre site Web. Connectez-vous simplement à votre compte et accédez à la section 'Historique des Commandes' pour obtenir des mises à jour en temps réel sur votre commande.<br></br><br></br>Nous vous remercions de votre attention rapide à ce sujet. Merci d'avoir choisi JN Freight. Nous sommes impatients de vous servir bientôt !";
                            const subject = "Confirmation Requise : Votre Commande Récente avec JN Freight";
                            sendEmail(reqData.email, subject, message);
                            return res.json('Command added');
                        })
                    }
                }
            });
        } else {
            const randomPass = generateRandomString(10);
            const randomPassHash = hashPassword(randomPass);
            const sql = "INSERT INTO users (email, name, password) VALUES ('"+ reqData.email +"', '"+ reqData.name +"', '"+ randomPassHash +"')";
            db.query(sql, (err, data) => {
                if (err) return res.json(err);
                getUserIDFromEmail(reqData.email, (error, userID) => {
                    if (error) {
                        console.error('Error:', error);
                    } else {
                        if (userID) {
                            const sql = "INSERT INTO commandes (user_id, date, lieu_depart, lieu_arrivee, description, confirmationToken) VALUES ('" + userID + "', '" + reqData.CommandDate + "', '" + reqData.CommandFrom + "', '" + reqData.CommandTo + "', '" + reqData.CommandDesc + "', '" + token + "')";
                            db.query(sql, (err, data) => {
                                if (err) return res.json(err);
                                const message = "Cher(e) " + reqData.name +",<br></br><br></br>Nous vous remercions d'avoir choisi JN Freight pour votre commande récente. Nous apprécions votre confiance !<br></br><br></br>Nous sommes heureux de vous informer que nous avons créé un compte pour vous afin de faciliter vos futures commandes. Voici vos informations de connexion :<br></br><br></br>Identifiant : " + reqData.email + "<br></br>Mot de passe : " + randomPass + "<br></br><br></br>Nous vous prions de bien vouloir confirmer votre commande en cliquant sur le lien de confirmation fourni ci-dessous dans les 24 prochaines heures. Voici les détails de votre commande :<br></br><br></br><strong>Date de la Commande : </strong>" + reqData.CommandDate + "<br></br><strong>Lieu de départ : </strong>" + reqData.CommandFrom + "<br></br><strong>Lieu d'arrivée : </strong>" + reqData.CommandTo + "<br></br><br></br><strong><a href='http://localhost:4000/confirmOrder?token=" + token + "'>Cliquer ici pour confirmer votre commande</> (Ce lien expirera dans les 24 heures)</strong><br></br><br></br>Veuillez noter que si votre commande n'est pas confirmée dans les 24 prochaines heures, elle sera automatiquement annulée.<br></br><br></br>Après avoir confirmé votre commande, vous pourrez suivre son statut et son avancement sur votre espace client sur notre site Web. Connectez-vous simplement à votre compte et accédez à la section 'Historique des Commandes' pour obtenir des mises à jour en temps réel sur votre commande.<br></br><br></br>Nous vous remercions de votre confiance envers JN Freight. Nous sommes impatients de vous servir bientôt !<br></br><br></br>Cordialement,<br></br><br></br>L'équipe JN Freight";
                                const subject = "Confirmation Requise : Votre Commande Récente avec JN Freight";
                                sendEmail(reqData.email, subject, message);
                                return res.json("Command added");
                            })
                        }
                    }
                });
            })
        }
    })
});

app.post ('/login', (req, res) => {

    console.log(req.body);
    const reqData = req.body;
    const hashedPass = hashPassword(reqData.password);
    const sql = "SELECT * FROM users WHERE email=?";
    const values = [
        reqData.username
    ]
    db.query(sql, values, (err, data) => {
        if (err) return res.json(err);
        if (data.length > 0) {
            localStorage.setItem('username', reqData.username);
            localStorage.setItem('loggedin', true);
            const returnData = [{
                res: "loggedin",
                loggedin: true,
                user: reqData.username
            }];
            return res.json(JSON.stringify(returnData));
        } else {
            return res.json(JSON.stringify[{ "res": "not exist"}])
        }
    })
});

app.get('/checkLoginStatus', (req, res) => {

    if (localStorage.getItem('loggedin')) {
        const data = [{
            loggedin: localStorage.getItem('loggedin'),
            user: localStorage.getItem('username')
        }];
        res.json(JSON.stringify(data));
    } else {
        res.json(JSON.stringify(data));
    }
});

app.get('/confirmOrder', (req, res) => {

    const token = req.query.token;
    const sql = "UPDATE commandes SET confirme='1', status='1' WHERE confirmationToken='" + token + "'";
    db.query(sql, (err, data) => {
        if (err) return res.json(err);
        return res.redirect('http://localhost:3000/commandeConfime');
    })
});

app.post('/getCommandes', (req, res) => {

    getUserIDFromEmail(req.body.user, (error, userID) => {
        if (error) {
            console.error('Error:', error);
        } else {
            if (userID) { 
                const sql = "SELECT * FROM commandes WHERE user_id=?";
                db.query(sql, userID ,(err, data) => {
                    if (err) return res.json(err);
                    return res.json(data);
                })
            }
        }
    });
})

app.listen(4000, () => {

    console.log("Listening on port 4000");
});