export default class Wave {
  constructor() {
    this.shapeX = 0.5;
    this.shapeY = 100;
    this.shapeZ = 100;
    this.shapeColor = 0xffffff;
  }

  init() {
    this.scene = new THREE.Scene();
    this.camera();
    this.renderer();
    this.light();
    this.floor();

    this.initShape();

    this.render();
  }

  camera() {
    this.camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 1, 5000);
    this.camera.position.y = 500;
    this.camera.position.z = 500;
    this.camera.position.x = 500;
    this.camera.updateProjectionMatrix();
    this.camera.lookAt(this.scene.position);
  }

  renderer() {
    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x202020, 1);
    this.renderer.shadowMapEnabled = true;
    this.renderer.shadowMapType = THREE.PCFSoftShadowMap;
    document.body.appendChild(this.renderer.domElement);
  }

  light() {
    var shadowlight = new THREE.DirectionalLight(0xffffff, 0.20);
    shadowlight.position.set(0, 1000, 0);
    shadowlight.castShadow = true;
    shadowlight.shadowDarkness = 0.1;
    this.scene.add(shadowlight);

    var light = new THREE.DirectionalLight(0xffffff, 1.2);
    light.position.set(60, 100, 20);
    this.scene.add(light);
  }

  floor() {
    var geometry = new THREE.PlaneGeometry(10000, 10000, 1, 1);
    var material = new THREE.MeshBasicMaterial({color: 0x202020});
    this.floor = new THREE.Mesh(geometry, material);
    this.floor.material.side = THREE.DoubleSide;
    this.floor.position.y = -150;
    this.floor.position.x = -1000;
    this.floor.rotation.x = 90 * Math.PI / 180;
    this.floor.rotation.y = 0;
    this.floor.rotation.z = 0;
    this.floor.doubleSided = true;
    this.floor.receiveShadow = true;
    this.scene.add(this.floor);
  }


  initShape() {
    this.myArray = new THREE.Group();

    this.scene.add(this.myArray);

    this.geometry = new THREE.BoxGeometry(10, 70, 100);
    this.material = new THREE.MeshLambertMaterial({color: 0x2e2e2e, shading: THREE.FlatShading});


    for (var i = 0; i < 100; i++) {
      this.layer = new THREE.Group();

      this.shape = new THREE.Mesh(this.geometry, this.material);
      //this.shape.rotation.y = -Math.PI/4;
      this.shape.position.x = -1500 + (i * 30);
      this.shape.position.y = -120;
      this.shape.castShadow = true;
      this.shape.receiveShadow = false;

      this.layer.add(this.shape);
      this.scene.add(this.layer);

      this.tl = new TimelineMax({repeat: -1, delay: i * 0.05, repeatDelay: 1});
      this.tl.to(this.shape.position, 0.5, {
        y: 0,
        ease: Power1.easeInOut
      });
      this.tl.to(this.shape.position, 0.5, {
        y: -120,
        ease: Power1.easeInOut
      });
    }
  }

  render() {
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}
  