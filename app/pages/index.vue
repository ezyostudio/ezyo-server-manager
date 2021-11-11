<template>
  <div class="row me-5">
    <div class="main p-5 col-md-9">
      <div class="d-flex justify-content-between mb-5">
        <div>
          <h1 class="m-0">Dashboard</h1>
          <h2 class="m-0 text-muted">Projects</h2>
        </div>
        <div class="d-flex p-3 gap-2">
          <search-input v-model="searchTerm" />
          <button class="py-2 px-3 d-flex align-items-center justify-content-center btn-dark text-light"
            @click.prevent="displayForm">
            <icon-github width="15px" height="15px" type="full" class="me-2" /> Add Repository
          </button>
        </div>
      </div>
      <div class="projects-grid gap-4">
        <div class="project" v-for="project in filteredProjects" :key="project.name">
          <a class="project_repository" v-show="project.repository" :href="project.repository" target="_blank">
            <icon-external width="20px" height="20px" />
          </a>

          <div class="row p-4">
            <div class="project_icon p-0">
              <component :is="getIcon(project.type)" />
            </div>
            <div class="col-auto">
              <h3 class="project_name m-0">{{project.name}}</h3>
              <span class="project_type d-block">Unknown state</span>
              <span class="project_type d-block">{{formatDate(project.createdAt)}}</span>
            </div>
          </div>
        </div>
        <div v-show="filteredProjects.length < projects.length" class="project project-skeletton" @click="clearFilters">
          <div class="row p-4">
            <div class="project_icon p-0">
              <icon-eye-off-line />
            </div>
            <div class="col-auto">
              <h3 class="project_name m-0">{{projects.length - filteredProjects.length}} Projects hidden</h3>
              <span class="project_type m-0">Click to remove filters</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="sidebar col-md-3 d-grid justify-content-center align-content-center">
      <div class="d-grid">
        A sidebar with server's stats and actions like reboot, etc...
      </div>
    </div>


  </div>
</template>

<style lang="scss" scoped>
  .projects-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);

    .project {
      background-color: #ffffff;
      border-radius: 25px;
      aspect-ratio: 1;
      position: relative;

      .project_icon {
        /* position: absolute; */
        width: 4em;
        /* background-color: ; */
      }

      .project_repository {
        position: absolute;
        right: 1em;
        top: 1em;
        pointer-events: none;
        opacity: 0;
        transition: opacity .3s;
      }

      .project_name {
        text-transform: capitalize;
      }

      &:hover {
        .project_repository {
          pointer-events: all;
          opacity: .5;

          &:hover {
            opacity: 1;
          }
        }
      }

      &.project-skeletton {
        opacity: 0.7;
        cursor: pointer;
      }
    }
  }

  .sidebar {
    background-color: #ececf6;
  }

  button {
    border: none;
    border-radius: 20px;
    text-transform: capitalize;
    background: none;
    cursor: pointer;

    &.btn-success {
      color: white;
      background: #74B566;

      &:hover {
        background: #438340;
      }
    }

    &.btn-dark {
      background: #333;
    }


  }

  .projects-table {
    .project-name {
      text-transform: capitalize;
    }
  }

</style>

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
        searchTerm: "",
      }
    },
    mounted() {
      window.vueInstance = this
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

        return projects
      }
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
          confirmButtonText: 'Look up',
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
        let iconName = 'nodejs';
        if (projectType.startsWith('node')) {
          iconName = 'nodejs';
        }

        return 'icon-' + iconName;
      },
      formatDate(date) {
        return date ? new Date(date).toLocaleDateString() : '';
      },
      clearFilters() {
        this.searchTerm = ''
      }
    },
  }

</script>
