//falta: 1- revisar que no este el email en la base
// 2- touched
// 3- disable boton enviar luego de submit (queda mas lindo)

import React, { Component } from 'react';
import './App.css';
import { withStyles } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
import Cards from 'react-credit-cards';
import 'react-credit-cards/es/styles-compiled.css';
import CreditCardInput from 'react-credit-card-input';


const styles = theme => ({
	root: {
		display: 'flex',
		flexWrap: 'wrap'
	},
	formControl: {
		margin: theme.spacing.unit,
		minWidth: 120
	},
	selectEmpty: {
		marginTop: theme.spacing.unit * 2
	},
	chips: {
		display: 'flex',
		flexWrap: 'wrap'
	},
	chip: {
		margin: theme.spacing.unit / 4
	}
});

const paises = require('country-list')().getNames();

class App extends Component {
	constructor (props) {
		super(props);
		this.state = {
			subscriptionState: 0,		// 0=subscribiendo , 1 subscripion realizada, 2 isSubmitting
			subscriptionType: '0',			// 0=free, 1=premium
			urlPost: 'https://server-subscripcion-jsbrbnwqfv.now.sh/subscripciones',
			nombre: '', email: '', pais: '',
			cardNum: '',cardExp: '',cardCvv: ''
		};
	}

	initializeSubscription = () => this.setState({subscriptionState: 0, subscriptionType: '0',nombre: '',email: '', pais: '',cardNum: '',cardExp: '',cardCvv: ''})
		//initializeSubscription = () => this.setState({subscriptionState: 0, subscriptionType: 0,nombre: '',email: '', pais: '',cardNum: '',cardExp: '',cardCvv: ''})
	finalizeSubscription = () =>  this.setState({ subscriptionState: 1 })
	componentDidMount () {ValidatorForm.addValidationRule('isCompleteName', v => (v.match(/^[a-zA-Z\s]+$/) && v.split(" ").length>1) ?true:false);}
	handleChange = event => this.setState({ [event.target.name]: event.target.value })
	changeVariant = () =>	this.setState({ subscriptionType: !this.state.subscriptionType })

	postSubscription = () => {
		this.setState({ subscriptionState: 2 });

		const { nombre, email, pais, subscriptionType,cardNum, cardExp, cardCvv, subscriptionState} = this.state;
		if(subscriptionState==="2")return 0;

		if(!(nombre && email && pais)){
			alert('complete los campos');
			return 0;
		}
		let postBody = {subscripcion: 'Free', nombre: nombre, email: email, pais: pais};
		if(subscriptionType){
			if(!(cardNum && cardExp && cardCvv)){
				alert('complete los campos');
				return 0;
			}

			postBody.subscripcion = "Premium"; postBody.cardNum=cardNum;postBody.cardExp=cardExp;postBody.cardCvv=cardCvv;
		}
		console.log(JSON.stringify(postBody));
		fetch(this.state.urlPost, {	method: 'post', headers: {'Content-Type': 'application/json'},body: JSON.stringify(postBody)})
			.then(response => response.json())
			.then(data => this.finalizeSubscription())
			.catch(error => console.log(error,' catch the hoop'))
	}

	render () {
		const { pais, subscriptionType} = this.state;

		return (
			<div className='App'><h1 className='App-title'>Formulario de Subscripción</h1>
					{!this.state.subscriptionState ? (<form><ValidatorForm >
									<Button variant={!subscriptionType?'contained':'outlined'} color='primary' onClick={this.changeVariant}>Free (0)</Button>{'  '}
									<Button variant={subscriptionType?'contained':'outlined'} color='primary' onClick={this.changeVariant}>Premium (u$s 10)</Button><br />

										<TextValidator label='Nombre y Apellido' onChange={this.handleChange} name='nombre' value={this.state.nombre}
											validators={[ 'required', 'isCompleteName' ]} errorMessages={['campo requerido', 'recuerde ingresar nombre y apellido']}/><br />

										<TextValidator label='Email' onChange={this.handleChange} name='email' value={this.state.email}
											validators={[ 'required', 'isEmail' ]} errorMessages={[ 'campo requerido', 'email inválido' ]}/><br />
									 <InputLabel htmlFor='country-helper'>Pais  </InputLabel>
										<Select	value={pais} onChange={this.handleChange} input={<Input name='pais' id='country-helper' />}>
											{paises.map(pais => (<MenuItem key={pais} value={pais}>{pais}</MenuItem>))}
										</Select><br /><br />
										</ValidatorForm>

								{subscriptionType && (<div className='tarjeta'>
									<CreditCardInput cardCVCInputRenderer={({ handleCardCVCChange, props }) => (
											<input {...props} onChange={handleCardCVCChange(e => this.setState({ cardCvv: e.target.value }))}/>)}
										cardExpiryInputRenderer={({handleCardExpiryChange,props}) => (
											<input {...props} onChange={handleCardExpiryChange(e =>	this.setState({ cardExp: e.target.value }))}/>)}
										cardNumberInputRenderer={({handleCardNumberChange,props}) => (
											<input {...props}	onChange={handleCardNumberChange(e =>	this.setState({ cardNum: e.target.value }))}/>)}/>
									<Cards number={this.state.cardNum} name={this.state.nombre} expiry={this.state.cardExp} cvc={this.state.cardExp} focused={0} /></div>)}

							<Button variant='contained' color='primary' onClick={this.postSubscription}>Enviar</Button>{'  '}
							<Button variant='contained' color='primary' onClick={this.initializeSubscription}>Cancelar</Button>
						</form>)
					:
					(<div><h1>Subscripción enviada!</h1><Button variant='contained' color='primary' onClick={this.initializeSubscription}>Volver</Button></div>)}</div>
			);
	}
}

export default withStyles(styles)(App);
