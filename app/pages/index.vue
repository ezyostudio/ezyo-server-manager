<template>
  <div class="row layout p-0 m-0">
    <Modal :show="modalStatus" @close="modalStatus=false" :project="modalProject" />
    <div class="main p-5 col-md-9">
      <div class="d-flex justify-content-between mb-5">
        <div>
          <h1 class="m-0">Dashboard</h1>
          <h2 class="m-0 text-muted">{{sseStatusString}}</h2>
        </div>
        <div class="d-flex p-3 gap-2">
          <search-input v-model="searchTerm" />
          <button class="py-2 px-3 d-flex align-items-center justify-content-center btn-dark text-light btn-anim"
            @click.prevent="displayForm">
            <icon-github width="15px" height="15px" type="full" class="me-2" /> Add Repository
          </button>
        </div>
      </div>
      <div class="projects-grid">
        <div class="p-0 project" v-for="project in filteredProjects" :key="project.name">
            <illustration-website class="p-4 aspect"/>
            <div class="project_icons d-flex">
                <a v-show="project.repository" :href="project.repository" target="_blank" class="me-2 btn-anim">
                <icon-external width="20px" height="20px" stroke="black"/>
              </a>
              <a @click.prevent="editToggle(project)">
                <icon-edit width="20px" height="20px" stroke="black"/>
              </a>
            </div>

          <div class="project-content row p-3 d-flex align-items-center">
            <div class="project_icon p-0 col-2">
              <component :is="getIcon(project.type)" />
            </div>
            <div class="col-9">
              <h3 class="project_name m-0">{{project.name}}</h3>
              <div class="row d-flex align-items-center">
                <span class="project_type d-block">{{formatDate(project.createdAt)}}</span>
              </div>
            </div>
            <div class="col-1">
              <span class="project_type d-block col-2"><div class="circle"></div></span>
            </div>
          </div>

        </div>
        <div v-if="filteredProjects.length < projects.length" class="project project-skeletton" @click="clearFilters">

          <illustration-preferences class="p-4 aspect"/>

          <div class="project-content row p-3 d-flex align-items-center">
            <div class="project_icon p-0 col-2">
              <icon-eye-off-line />
            </div>
            <div class="col-9">
              <h3 class="project_name m-0">{{projects.length - filteredProjects.length}} Projects hidden</h3>
              <div class="row d-flex align-items-center">
              <span class="project_type m-0">Click to remove filters</span>
              </div>
            </div>
            <div class="col-1">
              <span class="project_type d-block col-2"><div class="circle"></div></span>
            </div>
        </div>
                </div>

      </div>
    </div>

    <div class="sidebar col-md-3 py-5 px-3">
    <h3>Statistics</h3>
      <div class="row">
          <client-only>
            <div class="col-md-6">
                <VueSvgGauge
                  :start-angle="0"
                  :end-angle="360"
                  :value="stats.cpuUsage"
                  :separator-step="0"
                  :min="0"
                  :max="1"
                  gauge-color="#59b2f2"
                  :scale-interval="0"
                >
                  <span class="gauge_text">CPU</span>>
                </VueSvgGauge>
            </div>
  
            <div class="col-md-6">
                <VueSvgGauge
                :start-angle="0"
                :end-angle="360"
                :value="stats.memUsage"
                :separator-step="0"
                :min="0"
                :max="1"
                gauge-color="#59b2f2"
                :scale-interval="0"
              >
                <span class="gauge_text">RAM</span>>
              </VueSvgGauge>
            </div>
          </client-only>
          <p class="p-3">
          Server uptime: {{$dayjs(Date.now() - stats.uptime * 1000).fromNow()}}<br>
          Manager uptime: {{$dayjs(Date.now() - stats.processUptime * 1000).fromNow()}}
          </p>
        </div>

        <h3>Actions</h3>
        <p>
          <button class="btn btn-dark">Restart server</button>
        </p>

      </div>
    </div>
  </div>
</template>


<script>
  export default {
    async fetch() {
      const projects = await this.$api.$get("/projects")

      projects.sort((a, b) => b.createdAt - a.createdAt);

      this.projects = projects;
    },
    data() {
      return {
        projects: [],
        modalProject: null,
        modalStatus: false,
        searchTerm: "",
        sse: null,
        sseStatus: 2,
        stats: {
          cpuUsage: 0,
          memUsage: 0,
          processUptime: 0,
          uptime: 0,
        }
      }
    },
    mounted() {
      window.vueInstance = this;

      this.sse = new EventSource(`${this.$api.defaults.baseURL}stats`);
      this.sseStatus = this.sse.readyState
      this.sse.onerror = this.sseError;
      this.sse.onmessage = this.sseMessage;
    },
    computed: {
      filteredProjects() {
        let searchTerm = this.searchTerm;
        let projects = [...this.projects];


        if (searchTerm.length == 0) return projects;

        if (searchTerm.startsWith('type:')) {
          return projects.filter(project => project.type.includes(searchTerm.replace('type:', '')));
        }

        projects = projects.filter(project => project.name.includes(searchTerm));
        console.log(projects.length)

        return projects
      },
      sseStatusString() {
        switch (this.sseStatus) {
          case 0:
            return 'Connecting';
          case 1:
            return 'Connected';
          case 2:
            return 'Disconnected';
        }
      },
    },
    methods: {
      displayForm: function () {
        this.$swal.fire({
          title: 'Submit your Github repository URL',
          input: 'text',
          inputAttributes: {
            autocapitalize: 'off'
          },
          showCancelButton: true,
          confirmButtonText: 'Add repo',
          confirmButtonColor: '#59B2F2',
          showLoaderOnConfirm: true,
          preConfirm: (repository) => {
            return this.$api.$post("/projects", {
              repository
            })
          },
          allowOutsideClick: () => !this.$swal.isLoading()
        }) //.then((result) => {
        //   if (result.isConfirmed) {
        //     this.$swal.fire({
        //       title: `${result.value.login}'s avatar`,
        //       imageUrl: result.value.avatar_url
        //     })
        //   }
        // })
      },
      getIcon(projectType) {
        let iconName = 'question-line';
        if (projectType.startsWith('node')) {
          iconName = 'nodejs';
        }

        if (projectType.startsWith('static')) {
          iconName = 'folder';
        }

        return 'icon-' + iconName;
      },
      formatDate(date) {
        return date ? new Date(date).toLocaleDateString() : '';
      },
      clearFilters() {
        this.searchTerm = "";
      },
      sseError(...args) {
        this.sseStatus = this.sse.readyState
        console.error(...args);
      },
      sseMessage({data}) {
        this.sseStatus = this.sse.readyState
        this.stats = {
          ...this.stats,
          ...JSON.parse(data)
        }
      },
      editToggle(project) {
        this.modalProject = project;
        this.modalStatus = true
      },
      toggleModal() {
        return true
      }
      
    },
  }

</script>

<style lang="scss" scoped>
  .projects-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1em;

    .project {
      background-color: #ffffff;
      border-radius: 25px;
      -webkit-box-shadow: 0px 3px 9px 0px #000000;
      box-shadow: 0px 3px 5px 0px rgba($color: #000000, $alpha: 0.2);
      position: relative;
      background: #ececf6;
      display: flex;
      justify-content: space-between;
      flex-direction: column;

      .aspect {
        aspect-ratio: 16/9;
      }

      .project_icons {
        position: absolute;
        left: 1em;
        top: 1.3em;
        pointer-events: none;
        opacity: 0;
        transform: translateX(-15px);
        transition: all .3s;

        a {
          opacity: .5;
          transition: opacity .3s;
        }

      }

      .project-content {
        background: white;
        border-radius: 25px;
        box-sizing: border-box;
        width: 100%;
        margin: 0 auto;

        .project_icon {
        width: 2em;
        }

        .circle {
          width: 15px;
          height: 15px;
          border-radius: 15px;
          background-color: #74B566;
          position: relative;

          &::before {
            content:'Active';
            position: absolute;
            top: -25px;
            left: calc(15px/2);
            transform: translateX(-50%);
            opacity: 0;
            pointer-events: none;
            transition: opacity .3s ease-in;
            background: #f1f1f1;
            padding: .2em .4em;
            border-radius: 5px;

          }

          &:hover::before {
            opacity: 1;
          }
        }

        .project_name {
          text-transform: capitalize;
          font-weight: 600;
          font-size: 1.1em;
        }

        span {
          font-size: 0.9em;
        }
      }

      &:hover {
        .project_icons {
          pointer-events: all;
          transform: translateX(0);
          opacity: 1;
          
          a {
            cursor: pointer;
          }

          a:hover {
            opacity: 1;
          }
        }
      }

      &.project-skeletton {
        opacity: 1;
        cursor: pointer;
      }
    }
  }

  .sidebar {
    background-color: #ececf6;

    .gauge_text {
      width: 100%;
      height: 100%;
      display: grid;
      place-content: center;
      font-weight: bold;
    }
  }

  .btn-anim {
      transform: scale(1);
      transition: transform .2s;
      &:active {
        transform: scale(0.9);
      }
    }

  .projects-table {
    .project-name {
      text-transform: capitalize;
    }
  }

</style>
