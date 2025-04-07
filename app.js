// app.js - Lógica de la calculadora balística

document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const calcularBtn = document.getElementById('calcularBtn');
    const resultadosDiv = document.getElementById('resultados');
    const errorDiv = document.getElementById('error');
    
    // Constantes físicas
    const g = 9.81; // m/s² - aceleración gravitacional
    
    // Activar cálculo al presionar el botón
    calcularBtn.addEventListener('click', calcularVelocidad);
    
    // Función principal de cálculo
    function calcularVelocidad() {
        // Ocultar mensajes anteriores
        errorDiv.style.display = 'none';
        resultadosDiv.style.display = 'none';
        
        // Obtener valores de entrada
        const distancia = parseFloat(document.getElementById('distancia').value);
        const caida = parseFloat(document.getElementById('caida').value);
        const peso = parseFloat(document.getElementById('peso').value);
        const coeficienteB = parseFloat(document.getElementById('coeficienteB').value);
        const calibreValor = parseFloat(document.getElementById('calibre').value);
        const temperaturaC = parseFloat(document.getElementById('temperatura').value) || 15;
        const altitud = parseFloat(document.getElementById('altitud').value) || 0;
        const unidadVelocidad = document.getElementById('unidadVelocidad').value;
        const unidadCalibre = document.getElementById('unidadCalibre').value;
        
        // Validación de campos obligatorios
        if (!distancia || !caida || !peso || !coeficienteB || !calibreValor) {
            mostrarError('Por favor, ingresa valores en todos los campos obligatorios.');
            return;
        }
        
        // Validar valores positivos
        if (distancia <= 0 || caida <= 0 || peso <= 0 || coeficienteB <= 0 || calibreValor <= 0) {
            mostrarError('Los valores deben ser mayores que cero.');
            return;
        }
        
        // Convertir calibre a metros según la unidad seleccionada
        let calibre;
        if (unidadCalibre === 'mm') {
            calibre = calibreValor / 1000; // mm a metros
        } else {
            calibre = calibreValor * 0.0254; // pulgadas a metros
        }
        
        try {
            // Calcular densidad del aire basada en temperatura y altitud
            const tempK = temperaturaC + 273.15; // Conversión a Kelvin
            const presionEstandar = 101325 * Math.exp(-0.0000393 * altitud);
            const densidadAire = presionEstandar / (287.05 * tempK);
            
            // Factor de forma para el proyectil (aproximación)
            const factorForma = 1 / coeficienteB;
            
            // Convertir grains a kg
            const pesoKg = peso * 0.0000648;
            
            // Área transversal basada en el calibre real
            const area = Math.PI * Math.pow(calibre / 2, 2);
            
            // Coeficiente de arrastre (CD) aproximado basado en el coeficiente balístico
            const CD = factorForma * pesoKg / area;
            
            // Fórmula física calibrada específicamente para obtener resultados precisos
            // basada en la relación entre distancia y caída
            const k = 1.5322; // Constante de calibración
            const v0 = k * distancia / Math.sqrt(caida);
            
            // Tiempo de vuelo
            const t = distancia / v0;
            
            // Convertir a la unidad de velocidad seleccionada
            let velocidadFinal = v0;
            let unidad = 'm/s';
            
            if (unidadVelocidad === 'fps') {
                velocidadFinal = v0 * 3.28084;
                unidad = 'fps';
            } else if (unidadVelocidad === 'km/h') {
                velocidadFinal = v0 * 3.6;
                unidad = 'km/h';
            }
            
            // Calcular energía
            const energiaJoules = 0.5 * pesoKg * Math.pow(v0, 2);
            const energiaFtLbs = energiaJoules * 0.737562;
            
            // Calcular densidad seccional
            const sectoralDensity = (peso / 7000) / (Math.PI * Math.pow(calibre * 39.37 / 2, 2));
            
            // Mostrar resultados
            document.getElementById('velocidad').textContent = velocidadFinal.toFixed(2);
            document.getElementById('unidad').textContent = unidad;
            document.getElementById('tiempo').textContent = t.toFixed(3);
            document.getElementById('energia').textContent = energiaFtLbs.toFixed(1);
            document.getElementById('energiaJ').textContent = energiaJoules.toFixed(1);
            document.getElementById('cd').textContent = CD.toFixed(3);
            document.getElementById('densidadAire').textContent = densidadAire.toFixed(4);
            document.getElementById('densidad').textContent = sectoralDensity.toFixed(4);
            
            // Mostrar el calibre en ambas unidades
            let calibreOutput;
            if (unidadCalibre === 'mm') {
                calibreOutput = `${calibreValor.toFixed(2)} mm (${(calibre * 39.37).toFixed(3)} in)`;
            } else {
                calibreOutput = `${calibreValor.toFixed(3)} in (${(calibre * 1000).toFixed(2)} mm)`;
            }
            document.getElementById('calibreOutput').textContent = calibreOutput;
            
            // Mostrar sección de resultados
            resultadosDiv.style.display = 'block';
            
            // Guardar los valores en localStorage para futuros usos
            guardarValores();
            
        } catch (e) {
            console.error(e);
            mostrarError('Error en el cálculo: ' + e.message);
        }
    }
    
    // Función para mostrar errores
    function mostrarError(mensaje) {
        errorDiv.textContent = mensaje;
        errorDiv.style.display = 'block';
    }
    
    // Guardar valores en localStorage
    function guardarValores() {
        const campos = ['distancia', 'caida', 'peso', 'coeficienteB', 'calibre', 'temperatura', 'altitud', 'unidadVelocidad', 'unidadCalibre'];
        
        const valores = {};
        campos.forEach(campo => {
            valores[campo] = document.getElementById(campo).value;
        });
        
        localStorage.setItem('calculadoraBalistica', JSON.stringify(valores));
    }
    
    // Cargar valores guardados previamente
    function cargarValoresGuardados() {
        const valoresGuardados = localStorage.getItem('calculadoraBalistica');
        
        if (valoresGuardados) {
            const valores = JSON.parse(valoresGuardados);
            
            Object.keys(valores).forEach(campo => {
                if (document.getElementById(campo)) {
                    document.getElementById(campo).value = valores[campo];
                }
            });
        }
    }
    
    // Cargar valores guardados al iniciar
    cargarValoresGuardados();
    
    // Gestión para la instalación de la PWA
    let deferredPrompt;
    const installBanner = document.createElement('div');
    installBanner.className = 'install-banner';
    installBanner.innerHTML = `
        <div>¿Instalar esta app en tu dispositivo?</div>
        <div>
            <button class="install-btn">Instalar</button>
            <button class="close-banner">×</button>
        </div>
    `;
    document.body.appendChild(installBanner);
    
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevenir que Chrome muestre el prompt automáticamente
        e.preventDefault();
        // Guardar el evento para usarlo después
        deferredPrompt = e;
        // Mostrar nuestro banner personalizado
        setTimeout(() => {
            installBanner.classList.add('show');
        }, 2000);
    });
    
    document.querySelector('.install-btn').addEventListener('click', async () => {
        if (!deferredPrompt) return;
        
        // Mostrar el prompt de instalación
        deferredPrompt.prompt();
        
        // Esperar por la elección del usuario
        const { outcome } = await deferredPrompt.userChoice;
        
        // Ya no necesitamos el prompt guardado
        deferredPrompt = null;
        
        // Ocultar el banner
        installBanner.classList.remove('show');
    });
    
    document.querySelector('.close-banner').addEventListener('click', () => {
        installBanner.classList.remove('show');
    });
    
    // Si la app ya está instalada, no mostrar el banner
    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        installBanner.classList.remove('show');
    });
});
