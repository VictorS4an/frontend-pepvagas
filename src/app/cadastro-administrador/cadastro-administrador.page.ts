import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { AdministradorService } from '../services/administrador.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-cadastro-administrador',
  templateUrl: './cadastro-administrador.page.html',
  styleUrls: ['./cadastro-administrador.page.scss'],
})
export class CadastroAdministradorPage implements OnInit {

  obrigatorio: FormGroup;

  public isDarkTheme: boolean = false
  public isLogged: boolean = false
  public id:any;

  constructor(private formBuilder: FormBuilder, private authService: AuthService,private navController: NavController, private toastController: ToastController, private adminService : AdministradorService) {
    if(this.authService.getJwt() == null)
      this.navController.navigateRoot('login')
    
    this.obrigatorio = this.formBuilder.group({
      nome: [null, Validators.required],
      email: [null, [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)]],      
      senha: [null, Validators.required]
    });
  }

  ngOnInit() {
    this.handleTheme()

    if (this.authService.getJwt()){
      this.isLogged = true
    } else {
      this.navController.navigateRoot('/')
    }
  }

  get email() {
    return this.obrigatorio.get('email');
  }

  logout() {
    this.authService.logout()
    this.navController.navigateForward('login')
  }

  toggleTheme() {
    if (this.isDarkTheme)
      this.isDarkTheme = false
    else
      this.isDarkTheme = true

    this.handleTheme()
  }

  private handleTheme() {
    if (this.isDarkTheme) {
      document.body.setAttribute('color-scheme', 'dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.body.setAttribute('color-scheme', 'light')
      localStorage.setItem('theme', 'light')
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

  public async onSubmit(){
    // Verifica se o formulário é válido
    if (this.obrigatorio.invalid) {
      this.obrigatorio.markAllAsTouched();
      
      if (this.email?.errors?.['pattern']) {
        this.presentToast('Por favor, insira um e-mail válido (exemplo: usuario@dominio.com).');
        return;
      }
      
      Object.keys(this.obrigatorio.controls).forEach(key => {
        const control = this.obrigatorio.get(key);
        if (control?.errors?.['required']) {
          this.presentToast(`O campo ${key} é obrigatório. Por favor, preencha-o.`);
        }
      });
      return;
    }
  
    if(this.obrigatorio.value["senha"].length < 4){
      this.presentToast('A senha deve ter pelo menos 4 digitos.');
      return;
    }
  
    let response = await this.authService.createAccount(this.obrigatorio.value["email"],this.obrigatorio.value["senha"],'A')
  
    if(response.data){
      response = await this.adminService.criar(response.data.idConta,this.obrigatorio.value["nome"])
      this.presentToast('Conta criada com sucesso');
      this.navController.back(); // Volta para a página anterior
    }
  }

}
